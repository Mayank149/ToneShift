from flask import Flask
from dotenv import load_dotenv

from .config import Config
from .routes import main_bp


def create_app() -> Flask:
    load_dotenv()

    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static",
        static_url_path="/static",
    )
    app.config.from_object(Config)
    app.register_blueprint(main_bp)
    return app
