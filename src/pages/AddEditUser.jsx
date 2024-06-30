import React, { useState, useEffect } from 'react';
import { Button, Form, Grid, Loader } from "semantic-ui-react";
import { storage, db } from "../firebase";
import { useParams, useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const initialState = {
    name: "",
    email: "",
    info: "",
    contact: "",
    latitude: "",
    longitude: "",
    businessType: "",
    industrySector: "",
    website: "",
    organizationSize: "",
    availability: "",
    additionalNotes: "",
    tags: "",
};

const AddEditUser = () => {
    const [data, setData] = useState(initialState);
    const {name, email, info, contact, latitude, longitude, businessType, industrySector, website, organizationSize, availability, additionalNotes, tags } = data;
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmit, setIsSubmit] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            getSingleUser();
        }
    }, [id]);

    const getSingleUser = async () => {
        const docRef = doc(db, "users", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            setData({ ...snapshot.data(), latitude: snapshot.data().latitude.toString(), longitude: snapshot.data().longitude.toString() });
        }
    };

    useEffect(() => {
        const uploadFile = () => {
            const name = new Date().getTime() + file.name;
            const storageRef = ref(storage, file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on("state_changed", (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
                switch (snapshot.state) {
                    case "paused":
                        console.log("Upload is Paused");
                        break;
                    case "running":
                        console.log("Upload is Running");
                        break;
                    default:
                        break;
                }
            }, (error) => {
                console.log(error)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setData((prev) => ({ ...prev, img: downloadURL }));
                })
            });
        };

        file && uploadFile()
    }, [file])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
        validateField(name, value);
    };

    const validateField = (fieldName, value) => {
        let error = null;

        switch(fieldName) {
            case 'name':
                if (!value) {
                    error = 'Name is required';
                }
                break;
            case 'email':
                if (!value) {
                    error = 'Email is required';
                }
                break;
            case 'info':
                if (!value) {
                    error = 'Info is required';
                }
                break;
            case 'contact':
                if (!value) {
                    error = 'Contact is required';
                }
                break;
            case 'latitude':
                if (!value) {
                    error = 'Latitude is required';
                }
                break;
            case 'longitude':
                if (!value) {
                    error = 'Longitude is required';
                }
                break;
            case 'businessType':
                if (!value) {
                    error = 'Business Type is required';
                }
                break;
            case 'industrySector':
                if (!value) {
                    error = 'Industry/Sector is required';
                }
                break;
            case 'website':
                if (!value) {
                    error = 'Website is required';
                }
                break;
            case 'organizationSize':
                if (!value) {
                    error = 'Organization Size is required';
                }
                break;
            case 'availability':
                if (!value) {
                    error = 'Availability is required';
                }
                break;
            case 'additionalNotes':
                if (!value) {
                    error = 'Additional Notes/Description is required';
                }
                break;
            case 'tags':
                if (!value) {
                    error = 'Tags are required';
                }
                break;
            default:
                break;
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: error,
        }));
    };

    const validate = () => {
        let valid = true;
        const newErrors = {};

        Object.keys(data).forEach((fieldName) => {
            validateField(fieldName, data[fieldName]);
            if (errors[fieldName]) {
                valid = false;
                newErrors[fieldName] = errors[fieldName];
            }
        });

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            setIsSubmit(true);
            try {
                const userData = {
                    ...data,
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                    timestamp: serverTimestamp()
                };

                if (!id) {
                    await addDoc(collection(db, "users"), userData);
                } else {
                    const docRef = doc(db, "users", id);
                    await updateDoc(docRef, userData);
                }

                navigate("/");
            } catch (error) {
                console.error("Error adding/updating document: ", error);
            } finally {
                setIsSubmit(false);
            }
        }
    };

    return (
        <div>
            <Grid centered verticalAlign='middle' columns="3" style={{ height: "80vh" }}>
                <Grid.Row>
                    <Grid.Column textAlign='center'>
                        <div>
                            {isSubmit ? <Loader active inline="centered" size="huge" /> : (
                                <>
                                    <h2>{id ? "Update User" : "Add User"}</h2>
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Input
                                            label="Name"
                                            error={errors.name ? { content: errors.name } : null}
                                            placeholder="Enter Name"
                                            name="name"
                                            onChange={handleChange}
                                            value={name}
                                            autoFocus
                                            onBlur={() => validateField('name', name)}
                                        />
                                        <Form.Input
                                            label="Email"
                                            error={errors.email ? { content: errors.email } : null}
                                            placeholder="Enter Email"
                                            name="email"
                                            onChange={handleChange}
                                            value={email}
                                            onBlur={() => validateField('email', email)}
                                        />
                                        <Form.TextArea
                                            label="Info"
                                            error={errors.info ? { content: errors.info } : null}
                                            placeholder="Enter Info"
                                            name="info"
                                            onChange={handleChange}
                                            value={info}
                                            onBlur={() => validateField('info', info)}
                                        />
                                        <Form.Input
                                            label="Contact"
                                            error={errors.contact ? { content: errors.contact } : null}
                                            placeholder="Enter Contact"
                                            name="contact"
                                            onChange={handleChange}
                                            value={contact}
                                            onBlur={() => validateField('contact', contact)}
                                        />
                                        <Form.Input
                                            label="Latitude"
                                            error={errors.latitude ? { content: errors.latitude } : null}
                                            placeholder="Enter Latitude"
                                            name="latitude"
                                            onChange={handleChange}
                                            value={latitude}
                                            onBlur={() => validateField('latitude', latitude)}
                                        />
                                        <Form.Input
                                            label="Longitude"
                                            error={errors.longitude ? { content: errors.longitude } : null}
                                            placeholder="Enter Longitude"
                                            name="longitude"
                                            onChange={handleChange}
                                            value={longitude}
                                            onBlur={() => validateField('longitude', longitude)}
                                        />
                                        <Form.Input
                                            label="Business Type"
                                            error={errors.businessType ? { content: errors.businessType } : null}
                                            placeholder="Enter Business Type"
                                            name="businessType"
                                            onChange={handleChange}
                                            value={businessType}
                                            onBlur={() => validateField('businessType', businessType)}
                                        />
                                        <Form.Input
                                            label="Industry/Sector"
                                            error={errors.industrySector ? { content: errors.industrySector } : null}
                                            placeholder="Enter Industry/Sector"
                                            name="industrySector"
                                            onChange={handleChange}
                                            value={industrySector}
                                            onBlur={() => validateField('industrySector', industrySector)}
                                        />
                                        <Form.Input
                                            label="Website"
                                            error={errors.website ? { content: errors.website } : null}
                                            placeholder="Enter Website"
                                            name="website"
                                            onChange={handleChange}
                                            value={website}
                                            onBlur={() => validateField('website', website)}
                                        />
                                        <Form.Input
                                            label="Size of Organization"
                                            error={errors.organizationSize ? { content: errors.organizationSize } : null}
                                            placeholder="Enter Size of Organization"
                                            name="organizationSize"
                                            onChange={handleChange}
                                            value={organizationSize}
                                            onBlur={() => validateField('organizationSize', organizationSize)}
                                        />
                                        <Form.Input
                                            label="Availability"
                                            error={errors.availability ? { content: errors.availability } : null}
                                            placeholder="Enter Availability"
                                            name="availability"
                                            onChange={handleChange}
                                            value={availability}
                                            onBlur={() => validateField('availability', availability)}
                                        />
                                        <Form.TextArea
                                            label="Additional Notes/Description"
                                            error={errors.additionalNotes ? { content: errors.additionalNotes } : null}
                                            placeholder="Enter Additional Notes/Description"
                                            name="additionalNotes"
                                            onChange={handleChange}
                                            value={additionalNotes}
                                            onBlur={() => validateField('additionalNotes', additionalNotes)}
                                        />
                                        <Form.Input
                                            label="Tags (e.g., #tag1, #tag2)"
                                            placeholder="Enter Tags"
                                            name="tags"
                                            onChange={handleChange}
                                            value={tags}
                                            onBlur={() => validateField('tags', tags)}
                                        />
                                        <Form.Input
                                            label="Upload"
                                            type="file"
                                            onChange={(e) => setFile(e.target.files[0])}
                                        />
                                        <Button primary type="submit" disabled={progress !== null && progress < 100} >
                                            {id ? "Update" : "Submit"}
                                        </Button>
                                    </Form>
                                </>
                            )}
                        </div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    )
};

export default AddEditUser;