from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    weather_api_key: str
    weather_api_base_url: str = "https://api.openweathermap.org/data/2.5"

    database_url: str = "mysql+pymysql://root:password@localhost:3306/weather_dashboard"

    secret_key: str = "dev-secret-change-me"
    access_token_expire_minutes: int = 1440

    frontend_origin: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()