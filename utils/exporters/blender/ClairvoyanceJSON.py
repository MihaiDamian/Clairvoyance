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

    def obj(self, obj_data):
        obj = {}
        obj['name'] = obj_data.name
        obj['location'] = list(obj_data.location)
        return obj

    def mesh(self, mesh_data):
        mesh = {}
        data_vertices = []
        for face in mesh_data.faces:
            for vertex_id in face.vertices:
                data_vertices += list(mesh_data.vertices[vertex_id].co)
        mesh['vertices'] = data_vertices
        return mesh

    def camera(self, camera_data):
        camera = {}
        camera['clipStart'] = camera_data.clip_start
        camera['clipEnd'] = camera_data.clip_end
        camera['fov'] = camera_data.angle
        return camera
    
    def create(self):
        data = {}
        data['meshes'] = []
        data['cameras'] = []

        #TODO: find a way to identify the actual active scene
        active_scene = bpy.data.scenes[0]

        for scene_object in active_scene.objects:
            obj = self.obj(scene_object)
            obj_data = scene_object.data
            if scene_object.type == 'MESH':
                obj.update(self.mesh(obj_data))
                data['meshes'].append(obj)
            elif scene_object.type == 'CAMERA':
                obj.update(self.camera(obj_data))
                data['cameras'].append(obj)
        
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

