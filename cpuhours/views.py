from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework import status
from django.http import HttpResponse, JsonResponse
from .models import *


# Create your views here.
@api_view(["POST"])
def csv_uploader_reader(request):
    data = []

    csv_file = request.FILES["csv"]

    if not csv_file.name.endswith('.csv'):
        return JsonResponse({"success":False, "message":"File is not CSV type","data":None})
    #if file is too large, return

    file_data = csv_file.read().decode("utf-8")	

    lines = file_data.split("\n")
    #loop over the lines and save them in db. If error , store as string and then display
    for line in lines:						
        fields = line.split(",")
        data_dict = {}
        data_dict["year"] = fields[0]
        data_dict["month"] = fields[1]
        data_dict["day"] = fields[2]
        data_dict["cpu_hours"] = fields[3]
        data.append(data_dict)
        if fields[0]!="year":
            item = Cpuhours.objects.filter( year = fields[0],month = fields[1], day =  fields[2],cpu_hours =  fields[3])
            if item.exists():
                continue
            else:
                Cpuhours(
                    year = fields[0],
                    month = fields[1],
                    day =  fields[2],
                    cpu_hours =  fields[3]
                ).save()
    return JsonResponse({"success":True, "message":"Success","data":data})