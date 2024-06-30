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
    const { name, email, info, contact, latitude, longitude, businessType, industrySector, website, organizationSize, availability, additionalNotes, tags } = data;
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

        switch (fieldName) {
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

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f0f0',
            padding: '20px',
        },
        formContainer: {
            width: '100%',
            maxWidth: '800px',
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        },
        form: {
            display: 'grid',
            gap: '15px',
        },
        field: {
            display: 'flex',
            flexDirection: 'column',
        },
        label: {
            marginBottom: '5px',
            fontWeight: 'bold',
        },
        input: {
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '16px',
            transition: 'border-color 0.3s',
        },
        inputError: {
            borderColor: '#e74c3c',
        },
        errorMessage: {
            color: '#e74c3c',
            fontSize: '14px',
            marginTop: '5px',
        },
        uploadContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        uploadLabel: {
            fontWeight: 'bold',
        },
        uploadInput: {
            display: 'none',
        },
        uploadButton: {
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
        uploadButtonHover: {
            backgroundColor: '#0056b3',
        },
        submitButton: {
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
        submitButtonHover: {
            backgroundColor: '#218838',
        },
        loader: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                {isSubmit ? (
                    <div style={styles.loader}>
                        <Loader active inline="centered" size="large" />
                    </div>
                ) : (
                    <Form style={styles.form} onSubmit={handleSubmit}>
                        <h2>{id ? "Update User" : "Add User"}</h2>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.name && styles.inputError) }}
                            />
                            {errors.name && <span style={styles.errorMessage}>{errors.name}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.email && styles.inputError) }}
                            />
                            {errors.email && <span style={styles.errorMessage}>{errors.email}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Info</label>
                            <textarea
                                name="info"
                                value={info}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.info && styles.inputError), minHeight: '100px' }}
                            />
                            {errors.info && <span style={styles.errorMessage}>{errors.info}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Contact</label>
                            <input
                                type="text"
                                name="contact"
                                value={contact}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.contact && styles.inputError) }}
                            />
                            {errors.contact && <span style={styles.errorMessage}>{errors.contact}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Latitude</label>
                            <input
                                type="number"
                                name="latitude"
                                value={latitude}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.latitude && styles.inputError) }}
                            />
                            {errors.latitude && <span style={styles.errorMessage}>{errors.latitude}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Longitude</label>
                            <input
                                type="number"
                                name="longitude"
                                value={longitude}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.longitude && styles.inputError) }}
                            />
                            {errors.longitude && <span style={styles.errorMessage}>{errors.longitude}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Business Type</label>
                            <input
                                type="text"
                                name="businessType"
                                value={businessType}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.businessType && styles.inputError) }}
                            />
                            {errors.businessType && <span style={styles.errorMessage}>{errors.businessType}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Industry/Sector</label>
                            <input
                                type="text"
                                name="industrySector"
                                value={industrySector}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.industrySector && styles.inputError) }}
                            />
                            {errors.industrySector && <span style={styles.errorMessage}>{errors.industrySector}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Website</label>
                            <input
                                type="url"
                                name="website"
                                value={website}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.website && styles.inputError) }}
                            />
                            {errors.website && <span style={styles.errorMessage}>{errors.website}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Organization Size</label>
                            <input
                                type="text"
                                name="organizationSize"
                                value={organizationSize}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.organizationSize && styles.inputError) }}
                            />
                            {errors.organizationSize && <span style={styles.errorMessage}>{errors.organizationSize}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Availability</label>
                            <input
                                type="text"
                                name="availability"
                                value={availability}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.availability && styles.inputError) }}
                            />
                            {errors.availability && <span style={styles.errorMessage}>{errors.availability}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Additional Notes/Description</label>
                            <textarea
                                name="additionalNotes"
                                value={additionalNotes}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.additionalNotes && styles.inputError), minHeight: '100px' }}
                            />
                            {errors.additionalNotes && <span style={styles.errorMessage}>{errors.additionalNotes}</span>}
                        </Form.Field>
                        <Form.Field style={styles.field}>
                            <label style={styles.label}>Tags</label>
                            <input
                                type="text"
                                name="tags"
                                value={tags}
                                onChange={handleChange}
                                style={{ ...styles.input, ...(errors.tags && styles.inputError) }}
                            />
                            {errors.tags && <span style={styles.errorMessage}>{errors.tags}</span>}
                        </Form.Field>
                        <Form.Field style={{ ...styles.field, marginTop: '1em' }}>
                            <label style={styles.label}>Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{ ...styles.input, display: 'none' }}
                            />
                            <div style={styles.uploadContainer}>
                                <label htmlFor="upload-file" style={styles.uploadLabel}>
                                    {file ? file.name : 'Choose file'}
                                </label>
                                <Button
                                    as="label"
                                    htmlFor="upload-file"
                                    style={{ ...styles.uploadButton, ...(file && styles.uploadButtonHover) }}
                                >
                                    Upload
                                    <input
                                        id="upload-file"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        style={styles.uploadInput}
                                    />
                                </Button>
                            </div>
                        </Form.Field>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1em' }}>
                            <Button
                                type="submit"
                                style={{ ...styles.submitButton, ...(progress && styles.submitButtonHover) }}
                                disabled={isSubmit || progress}
                            >
                                {id ? 'Update' : 'Submit'}
                            </Button>
                        </div>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default AddEditUser;
