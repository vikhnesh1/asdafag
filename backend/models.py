"""SQLAlchemy models for wind generation actuals and forecasts."""

from sqlalchemy import Float, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class WindActual(Base):
    """Actual wind generation outturn (from Elexon FUELHH dataset)."""

    __tablename__ = "wind_actuals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    start_time: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    settlement_date: Mapped[str] = mapped_column(String, nullable=False, index=True)
    settlement_period: Mapped[int] = mapped_column(Integer, nullable=False)
    generation: Mapped[float] = mapped_column(Float, nullable=False)

    __table_args__ = (
        Index("idx_actuals_settlement", "settlement_date", "settlement_period"),
    )

    def __repr__(self) -> str:
        return (
            f"<WindActual(start_time='{self.start_time}', "
            f"period={self.settlement_period}, generation={self.generation})>"
        )


class WindForecast(Base):
    """Wind generation forecast (from Elexon WINDFOR dataset)."""

    __tablename__ = "wind_forecasts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    start_time: Mapped[str] = mapped_column(String, nullable=False, index=True)
    publish_time: Mapped[str] = mapped_column(String, nullable=False, index=True)
    generation: Mapped[float] = mapped_column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint("start_time", "publish_time", name="uq_forecast_start_publish"),
        Index("idx_forecasts_lookup", "start_time", "publish_time"),
    )

    def __repr__(self) -> str:
        return (
            f"<WindForecast(start_time='{self.start_time}', "
            f"publish_time='{self.publish_time}', generation={self.generation})>"
        )
