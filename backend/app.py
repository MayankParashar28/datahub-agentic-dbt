import os
import gradio as gr
from app.main import app as fastapi_app

# Mount FastAPI app onto Gradio Space
app = fastapi_app
demo = gr.mount_gradio_app(app=fastapi_app, blocks=gr.Blocks(title="DataHub dbt Forge API"), path="/")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(fastapi_app, host="0.0.0.0", port=port)
