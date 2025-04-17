import json
from flask import Blueprint, request, jsonify
from app.api.auth import token_required
from app.models.data_models import db, Record
from datetime import datetime
from app.events import notify_database_change

database_bp = Blueprint('database', __name__)

@database_bp.route('/records', methods=['GET'])
@token_required
def get_records(current_user_id):
    # Parámetros de paginación con valores por defecto
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Filtro por tipo de registro
    record_type = request.args.get('record_type', None)
    
    # Filtros de fecha (formato ISO, por ejemplo "2025-04-01")
    start_date = request.args.get('start_date', None)
    end_date = request.args.get('end_date', None)
    
    # Construir la consulta inicial para el usuario actual
    query = Record.query.filter_by(user_id=current_user_id)
    
    # Filtrar por tipo de registro si se proporciona
    if record_type:
        query = query.filter_by(record_type=record_type)
    
    # Filtrar por rango de fecha, si se proporcionan
    if start_date:
        try:
            # Convierte a datetime, asumiendo formato ISO (YYYY-MM-DD)
            start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Record.timestamp >= start_datetime)
        except Exception as e:
            return jsonify({'error': 'start_date format must be YYYY-MM-DD'}), 400
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(Record.timestamp <= end_datetime)
        except Exception as e:
            return jsonify({'error': 'end_date format must be YYYY-MM-DD'}), 400
    
    # Ordenar los registros (ejemplo: timestamp descendente)
    query = query.order_by(Record.timestamp.desc())
    
    # Aplicar paginación
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    records_list = [{
        'id': record.id,
        'record_type': record.record_type,
        'data': record.data,
        'timestamp': record.timestamp.isoformat()
    } for record in pagination.items]

    # Notificar sobre la consulta realizada
    notify_database_change("query", "read", {
        'user_id': current_user_id,
        'record_type': record_type,
        'count': len(records_list),
        'page': page
    })

    return jsonify({
        'user_id': current_user_id,
        'records': records_list,
        'total': pagination.total,
        'pages': pagination.pages,
        'page': pagination.page,
        'per_page': pagination.per_page
    })

@database_bp.route('/records', methods=['POST'])
@token_required
def add_record(current_user_id):
    data = request.get_json()
    record_type = data.get('record_type')
    record_data = data.get('data')
    if not record_type or not record_data:
        return jsonify({'error': 'record_type and data are required'}), 400
    
    try:
        new_record = Record(
            record_type=record_type,
            data=json.dumps(record_data),
            user_id=current_user_id,
            timestamp=datetime.utcnow()
        )
        db.session.add(new_record)
        db.session.commit()
        
        # Emitir evento de creación de registro
        notify_database_change(record_type, "create", {
            'id': new_record.id,
            'user_id': current_user_id,
            'timestamp': new_record.timestamp.isoformat()
        })
        
        return jsonify({'message': 'Record added successfully.', 'id': new_record.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error adding record: {str(e)}'}), 500

@database_bp.route('/records/<int:record_id>', methods=['DELETE'])
@token_required
def delete_record(current_user_id, record_id):
    record = Record.query.filter_by(id=record_id, user_id=current_user_id).first()
    if not record:
        return jsonify({'error': 'Record not found.'}), 404
    
    record_type = record.record_type
    
    try:
        db.session.delete(record)
        db.session.commit()
        
        # Emitir evento de eliminación de registro
        notify_database_change(record_type, "delete", {
            'id': record_id,
            'user_id': current_user_id
        })
        
        return jsonify({'message': 'Record deleted successfully.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error deleting record: {str(e)}'}), 500
