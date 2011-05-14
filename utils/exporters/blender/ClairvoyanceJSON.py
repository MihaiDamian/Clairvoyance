bl_info = {
    "name": "Clairvoyance JSON Exporter",
    "author": "Mihai Damian",
    "blender": (2, 5, 7),
    "api": 36339,
    "location": "File > Import-Export",
    "description": "Export to JSON Format",
    "warning": "",
    "wiki_url": "https://github.com/MihaiDamian/Clairvoyance",
    "tracker_url": "",
    "support": 'COMMUNITY',
    "category": "Import-Export"}

if "bpy" in locals():
    from imp import reload
    if "ClairvoyanceJSON" in locals():
        reload(ClairvoyanceJSON)

import json

import bpy
from bpy.props import BoolProperty
from io_utils import ExportHelper


class ClairvoyanceJSON:
    string = ""
    prettyprint = False

    def __init__(self, prettyprint):
        self.prettyprint = prettyprint
    
    def create(self):
        data = {}
        data_meshes = []
        for mesh in bpy.data.meshes:
            data_mesh = {}
            data_mesh['name'] = mesh.name
            data_vertices = []
            for vertex in mesh.vertices:
                data_vertices += list(vertex.co)
            data_mesh['vertices'] = data_vertices
            data_meshes.append(data_mesh)
        data['meshes'] = data_meshes
        
        if self.prettyprint:
            self.string = json.dumps(data, sort_keys=True, indent=4)
        else:
            self.string = json.dumps(data, separators=(',', ':'))


class ExportJSON(bpy.types.Operator, ExportHelper):
    bl_idname = "export_scene.json"
    bl_label = "Export Clairvoyance JSON"

    filename_ext = ".js"

    prettyprint = BoolProperty(name="Prettyprint",
                               description="Nicely indented JSON",
                               default=False)
 
    def execute(self, context):
        filepath = self.filepath
        filepath = bpy.path.ensure_ext(filepath, self.filename_ext)
        json = ClairvoyanceJSON(self.prettyprint)
        json.create()
        content = json.string
        self.save_file(filepath, content)
        return {'FINISHED'}

    def save_file(self, filepath, content):
        with open(filepath, 'wb') as file:
            file.write(content.encode('utf-8'))

def menu_func_export(self, context):
    self.layout.operator(ExportJSON.bl_idname, text="Clairvoyance JSON (.js)")
 
def register():
    bpy.utils.register_class(ExportJSON)
    bpy.types.INFO_MT_file_export.append(menu_func_export)
 
def unregister():
    bpy.utils.unregister_class(ExportJSON)
    bpy.types.INFO_MT_file_export.remove(menu_func_export)

