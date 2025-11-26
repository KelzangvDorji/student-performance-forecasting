from sqlalchemy import Column, Integer, String, Float
from database import Base

class StudentPrediction(Base):
    __tablename__ = "student_predictions"

    id = Column(Integer, primary_key=True, index=True)
    semester = Column(Integer)
    department = Column(String)
    age = Column(Integer)
    gender = Column(String)
    attendance_percentage = Column(Float)
    study_hours_per_week = Column(Integer)
    backlogs = Column(Integer)
    part_time_work = Column(String)
    previous_cgpa = Column(Float)

    predicted_cgpa = Column(Float)
    academic_risk_level = Column(String)

