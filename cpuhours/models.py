from django.db import models


class Cpuhours(models.Model):
    year = models.IntegerField(default=0)
    month = models.IntegerField(default=0)
    day = models.IntegerField(default=0)
    cpu_hours = models.FloatField(default=0)