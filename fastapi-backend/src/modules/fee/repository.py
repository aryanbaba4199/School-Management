from src.common.repository import CRUDBase
from .models import FeeRecord, FeeTransaction
from .schemas import FeeRecordCreate, FeeRecordUpdate, FeeTransactionCreate, FeeTransactionUpdate

class CRUDFeeRecord(CRUDBase[FeeRecord, FeeRecordCreate, FeeRecordUpdate]):
    pass

class CRUDFeeTransaction(CRUDBase[FeeTransaction, FeeTransactionCreate, FeeTransactionUpdate]):
    pass

fee_record = CRUDFeeRecord(FeeRecord)
fee_transaction = CRUDFeeTransaction(FeeTransaction)
