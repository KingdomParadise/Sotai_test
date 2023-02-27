from django.urls import path
from .views import *

urlpatterns = [
    path("upload", csv_uploader_reader, name="csv_uploader_reader"),
]
