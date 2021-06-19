import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime

from src.common.database import Database


@dataclass
class Bus(object):
    loc: list
    bus: str
    dir: str = None
    next_stop: str = None
    current_location: str = None
    arrival_time: datetime = None
    utc_time: datetime = field(default_factory=lambda: datetime.utcnow())
    _id: str = field(default_factory=lambda: uuid.uuid4().hex)

    def save_to_mongo(self):
        Database.insert('buses', asdict(self))


if __name__ == '__main__':
    print(type(datetime.utcnow()))
