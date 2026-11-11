from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Banda Digital Ecosystem API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    ALLOWED_ORIGINS: str = "http://localhost:5175,http://localhost:5174,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5175,http://127.0.0.1:5174,http://127.0.0.1:5173"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5435/banda_digital"
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5435/banda_digital"

    # Security & JWT
    SECRET_KEY: str = "banda_neira_digital_secret_key_change_in_production_2026_secure"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cryptography & NIK Protection (AES-256-GCM + Blind Index HMAC-SHA256)
    AES_SECRET_KEY: str = "banda_neira_aes_256_gcm_master_key_32bytes_sec!"
    HMAC_BLIND_INDEX_PEPPER: str = "banda_neira_hmac_blind_index_pepper_salt_2026_xyz"
    RATE_LIMIT_NIK_SEARCH_PER_MINUTE: int = 20

    # Blockchain (Local EVM Testnet)
    BLOCKCHAIN_RPC_URL: str = "http://localhost:8545"
    BLOCKCHAIN_CHAIN_ID: int = 1337
    BLOCKCHAIN_CONTRACT_ADDRESS: str = "0x0000000000000000000000000000000000000000"
    BLOCKCHAIN_DEPLOYER_PRIVATE_KEY: str = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    BLOCKCHAIN_ENABLED: bool = True

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
