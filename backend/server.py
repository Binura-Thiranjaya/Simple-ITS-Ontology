from flask import Flask, request, jsonify
from owlready2 import *
from flask_cors import CORS
import math

app = Flask(__name__)

CORS(app)

#Load the ontology
ontology = get_ontology("itsV2v2.owl").load()

print(f"Ontology IRI: {ontology.base_iri}")
print(f"Classes in the ontology:")
for cls in ontology.classes():
    print(f" - {cls.name}")

print(f"Object properties in the ontology:")
for prop in ontology.object_properties():
    print(f" - {prop.name}")

print(f"Data properties in the ontology:")
for prop in ontology.data_properties():
    print(f" - {prop.name}")

print(f"Individuals in the ontology:")
for ind in ontology.individuals():
    print(f" - {ind.name}")

@app.route('/')
def its():
    return 'Welcome to the Intelligent Tutoring System!'

#Get all learners
@app.route('/get_all_learners', methods=['GET'])
def get_all_learners():
    learner_list = []
    for learner in ontology.search(iri="*Learner*"):
        if learner.studies:
            # Include both instance name and userName
            learner_list.append({
                "instance_name": learner.name,
                "userName": learner.userName
            })
    # Return the list of learners
    return jsonify({"learners": learner_list}), 200


#Calculate the area of a shape for a learner (pass the learner instance name and shape instance name)
@app.route('/calculate_area', methods=['GET'])
def calculate_area():
    learner_instance_name = request.args.get('learner_instance_name')
    shape_instance_name = request.args.get('shape_instance_name')
    
    if not learner_instance_name or not shape_instance_name:
        return jsonify({"error": "Please provide both learner instance name and shape instance name as query parameters."}), 400
    
    try:
        learner = ontology.search_one(iri=f"*{learner_instance_name}")
        if not learner:
            return jsonify({"error": f"No learner found with the name '{learner_instance_name}'."}), 404
        
        # Search for the shape instance in the ontology
        shape = ontology.search_one(iri=f"*{shape_instance_name}")
        if not shape:
            return jsonify({"error": f"No shape found with the name '{shape_instance_name}'."}), 404
        
        rectangle_class = ontology.search_one(iri="*Rectangle")
        circle_class = ontology.search_one(iri="*Circle")
        triangle_class = ontology.search_one(iri="*Triangle")
        if rectangle_class in shape.is_a:
            area = shape.width[0] * shape.length[0]
            equation = f"Width: {shape.width[0]} * Length: {shape.length[0]}"

        elif circle_class in shape.is_a:
            area = math.pi * (shape.radius[0] ** 2)
            equation = f"π * Radius: {shape.radius[0]}^2"
        elif triangle_class in shape.is_a:
            base = shape.base[0]
            height = shape.height[0]
            area = (base * height) / 2
            equation = f"(Base: {base} * Height: {height}) / 2"
            
        else:
            area = "Unknown Shape"
            equation = "Unknown Equation"

        return jsonify({"learner": learner_instance_name, "shape": shape_instance_name, "area": area, "equation": equation}), 200      
        
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500



#calculate learns assigned subjects pass learner instance from that get the subjects assigned to that learner
@app.route('/get_learner_subjects', methods=['GET'])
def get_learner_subjects():
    instance_name = request.args.get('instance_name')
    
    if not instance_name:
        return jsonify({"error": "Please provide an instance name as a query parameter."}), 400
    
    try:
        student = ontology.search_one(iri=f"*{instance_name}")
        subject_names = []
        if not student:
            return jsonify({"error": f"No student found with the name '{instance_name}'."}), 404
        
        studies_property = ontology.search_one(iri="*studies")
        if not studies_property:
            return jsonify({"error": "The 'studies' property was not found in the ontology."}), 500
        
        subjects = student.studies
        if not subjects:
            return jsonify({"student": instance_name, "subjects": "No subjects found."}), 200
        
        for subject in subjects:
            course_name = subject.courseName if hasattr(subject, "courseName") else "Unknown Course Name"
            course_credit = subject.credits if hasattr(subject, "credits") else "Unknown Credit"
            subject_names.append({"courseName": course_name, "credit": course_credit})
            #subject_names.append(course_name)
        return jsonify({"student": instance_name, "subjects": subject_names}), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
   

#get all the shapes available for the learner1 to canCalculateAreaOf 
@app.route('/get_learner_shapes', methods=['GET'])
def get_learner_shapes():
    instance_name = request.args.get('instance_name')
    
    if not instance_name:
        return jsonify({"error": "Please provide an instance name as a query parameter."}), 400
    
    try:
        student = ontology.search_one(iri=f"*{instance_name}")
        shape_names = []
        if not student:
            return jsonify({"error": f"No student found with the name '{instance_name}'."}), 404
        
        can_calculate_area_of_property = ontology.search_one(iri="*canCalculateAreaOf")
        if not can_calculate_area_of_property:
            return jsonify({"error": "The 'canCalculateAreaOf' property was not found in the ontology."}), 500
        
        shapes = student.canCalculateAreaOf
        if not shapes:
            return jsonify({"student": instance_name, "shapes": "No shapes found."}), 200
        
        for shape in shapes:
            shape_name = shape.name if hasattr(shape, "name") else "Unknown Shape Name"
            shape_names.append(shape_name)
        return jsonify({"student": instance_name, "shapes": shape_names}), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

                    

# main driver function
if __name__ == '__main__':
    app.run()
