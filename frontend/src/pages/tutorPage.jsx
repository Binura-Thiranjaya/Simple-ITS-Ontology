import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'

export default function TutorPage() {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [learners, setLearners] = useState([]);
    const [selectedLearner, setSelectedLearner] = useState("");
    const [learnerSubjects, setLearnerSubjects] = useState([]);
    const [learnerShapes, setLearnerShapes] = useState([]);
    const [area, setArea] = useState("");

    const [courses, setCourses] = useState([]);

    // Fetch learners from the API
    const fetchLearners = async () => {
        try {
            const response = await fetch(`${apiUrl}/get_all_learners`);
            const data = await response.json();
            //console.log(data);
            setLearners(data.learners || []); // Assuming the API returns { learners: [...] }
        } catch (error) {
            console.error('Error fetching learners:', error);
        }
    };

    // Fetch courses for the selected learner
    const fetchCourses = async (learnerName) => {
        try {
            const response = await fetch(`${apiUrl}/get_learner_subjects?instance_name=${learnerName}`);
            const data = await response.json();
            setLearnerSubjects(data.subjects || []); // Assuming the API returns { subjects: [...] }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    // Fetch shapes for the selected learner
    const fetchShapes = async (learnerName) => {
        try {
            const response = await fetch(`${apiUrl}/get_learner_shapes?instance_name=${learnerName}`);
            const data = await response.json();
            setLearnerShapes(data.shapes || []);
            if (data.shapes.length === 1) {
                const singleShape = data.shapes[0];
                //setSelectedLearner(learnerName);
                console.log("Learning Shapes: ", selectedLearner);
               fetchArea(singleShape);

            }else{
                setArea([]);
            }
 
           
        } catch (error) {
            console.error('Error fetching shapes:', error);
        }
    };
    // Handle learner selection
    const handleLearnerChange = (e) => {
        const learnerName = e.target.value;
        setSelectedLearner(learnerName);
        Swal.fire({
            title: 'Loading Courses...',
            html: handleLoader(), // Load the spinner
            showConfirmButton: false,
            allowOutsideClick: false,
        });

        if (learnerName) {
            setTimeout(() => {
                fetchCourses(learnerName).then(() => {
                    Swal.close(); // Close the loader after fetching
                }
                ).catch((error) => {
                    console.error('Error fetching courses:', error);
                    Swal.fire('Error', 'Unable to fetch courses. Please try again.', 'error');
                });
            }, 500);
           // fetchCourses(learnerName);
            fetchShapes(learnerName);
        } else {
            setCourses([]); // Clear courses if no learner is selected
        }
    };
    const handleLoader = () => {
        return `
            <div class="loader-container">
                <div class="spinner"></div>
            </div>
            <style>
                .loader-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100px;
                }
                .spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    };
    

    const fetchArea = async (shapeName) => {
        try {
            var learner = document.getElementById("learnerSelect");
            console.log("Selected Learner: ", learner.value);
            const response = await fetch(`${apiUrl}/calculate_area?learner_instance_name=${learner}&shape_instance_name=${shapeName}`);
            const data = await response.json();
            console.log(data);
            setArea(data || []);
        } catch (error) {
            console.error('Error fetching area:', error);
        }
    };


    const handleShapeChange = (e) => {
        const shapeName = e.target.value;
    
        Swal.fire({
            title: 'Calculating Area...',
            html: handleLoader(), // Load the spinner
            showConfirmButton: false,
            allowOutsideClick: false,
        });
    
        if (shapeName) {
            // Simulate an async operation
            setTimeout(() => {
                fetchArea(shapeName).then(() => {
                    Swal.close(); // Close the loader after fetching
                }).catch((error) => {
                    console.error('Error fetching area:', error);
                    Swal.fire('Error', 'Unable to fetch area. Please try again.', 'error');
                });
            }, 500); // Delay to simulate loader visibility
        } else {
            setArea([]);
            Swal.close(); // Close immediately if no shape is selected
        }
    };
    

    useEffect(() => {
        fetchLearners();        
    }, []);

    return (
        <div>
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Tutor Page</h5>
                    <p className="card-text">This is the tutor page.</p>
                </div>
            </div>
            {/* 2 Grid Column: Select DropDown and Table to load courses */}
            <div className="row mt-5">
                <div className="col-6">
                    <label htmlFor="learnerSelect" className="form-label">Select Learner</label>
                    <select
                        className="form-select"
                        id="learnerSelect"
                        aria-label="Select Learner"
                        onChange={handleLearnerChange}
                    >
                        <option value="">Select Learner</option>
                        {learners.map((learner, index) => (
                            <option key={index} value={learner.instance_name}>
                                {learner.userName}
                            </option>
                        ))}
                    </select>
                    <br />
                    <div>
                        <label htmlFor="courseSelect" className="form-label">Shapes Assigned</label>
                        <select 
                            className="form-select" 
                            aria-label="Select Shapes"
                            onChange={handleShapeChange}
                        >
                            {learnerShapes.map((shape, index) => (
                                <option key={index}>{shape}</option>
                            ))}
                        </select>
                        <p className="mt-3">Area Equation: {area.equation}</p>
                        <p className="mt-3 fw-bold h1">Area: {area.area}</p>

                    </div>
                </div>
                <div className="col-6">
                    <table className="table rounded">
                        <thead>
                            <tr>
                                <th scope="col">Course Name</th>
                                <th scope="col">Credits</th>
                            </tr>
                        </thead>
                        <tbody>
                        {learnerSubjects.length > 0 ? (
                                learnerSubjects.map((subjectList, index) => (
                                    <tr key={index}>
                                        <td>{subjectList.courseName}</td>
                                        <td>{subjectList.credit}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2">No courses available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
