from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import error

handler500 = error

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('quizes.urls', namespace='quizes')),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)