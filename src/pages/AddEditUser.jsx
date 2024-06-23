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
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const validate = () => {
        let errors = {};
        if (!name) {
            errors.name = "Name is Required";
        }
    
        if (!email) {
            errors.email = "Email is Required";
        }
    
        if (!info) {
            errors.info = "Info is Required";
        }
        if (!contact) {
            errors.contact = "Contact is Required";
        }
        if (!latitude) {
            errors.latitude = "Latitude is Required";
        }
        if (!longitude) {
            errors.longitude = "Longitude is Required";
        }
        if (!businessType) {
            errors.businessType = "Business Type is Required";
        }
        if (!industrySector) {
            errors.industrySector = "Industry/Sector is Required";
        }
        if (!website) {
            errors.website = "Website is Required";
        }
        if (!organizationSize) {
            errors.organizationSize = "Organization Size is Required";
        }
        if (!availability) {
            errors.availability = "Availability is Required";
        }
        if (!additionalNotes) {
            errors.additionalNotes = "Additional Notes/Description is Required";
        }
        if (!tags) {
            errors.tags = "Tags are Required";
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let errors = validate();
        if (Object.keys(errors).length) {
            return setErrors(errors);
        }
        setIsSubmit(true);
        if (!id) {
            try {
                await addDoc(collection(db, "users"), {
                    ...data,
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                    timestamp: serverTimestamp()
                });
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                const docRef = doc(db, "users", id);
                await updateDoc(docRef, {
                    ...data,
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                    timestamp: serverTimestamp()
                });
            } catch (error) {
                console.log(error);
            }
        }
        navigate("/")
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
                                        />
                                        <Form.Input
                                            label="Email"
                                            error={errors.email ? { content: errors.email } : null}
                                            placeholder="Enter Email"
                                            name="email"
                                            onChange={handleChange}
                                            value={email}
                                        />
                                        <Form.TextArea
                                            label="Info"
                                            error={errors.info ? { content: errors.info } : null}
                                            placeholder="Enter Info"
                                            name="info"
                                            onChange={handleChange}
                                            value={info}
                                        />
                                        <Form.Input
                                            label="Contact"
                                            error={errors.contact ? { content: errors.contact } : null}
                                            placeholder="Enter Contact"
                                            name="contact"
                                            onChange={handleChange}
                                            value={contact}
                                        />
                                        <Form.Input
                                            label="Latitude"
                                            error={errors.latitude ? { content: errors.latitude } : null}
                                            placeholder="Enter Latitude"
                                            name="latitude"
                                            onChange={handleChange}
                                            value={latitude}
                                        />
                                        <Form.Input
                                            label="Longitude"
                                            error={errors.longitude ? { content: errors.longitude } : null}
                                            placeholder="Enter Longitude"
                                            name="longitude"
                                            onChange={handleChange}
                                            value={longitude}
                                        />
                                        <Form.Input
                                            label="Business Type"
                                            error={errors.businessType ? { content: errors.businessType } : null}
                                            placeholder="Enter Business Type"
                                            name="businessType"
                                            onChange={handleChange}
                                            value={businessType}
                                        />
                                        <Form.Input
                                            label="Industry/Sector"
                                            error={errors.industrySector ? { content: errors.industrySector } : null}
                                            placeholder="Enter Industry/Sector"
                                            name="industrySector"
                                            onChange={handleChange}
                                            value={industrySector}
                                        />
                                        <Form.Input
                                            label="Website"
                                            error={errors.website ? { content: errors.website } : null}
                                            placeholder="Enter Website"
                                            name="website"
                                            onChange={handleChange}
                                            value={website}
                                        />
                                        <Form.Input
                                            label="Size of Organization"
                                            error={errors.organizationSize ? { content: errors.organizationSize } : null}
                                            placeholder="Enter Size of Organization"
                                            name="organizationSize"
                                            onChange={handleChange}
                                            value={organizationSize}
                                        />
                                        <Form.Input
                                            label="Availability"
                                            error={errors.availability ? { content: errors.availability } : null}
                                            placeholder="Enter Availability"
                                            name="availability"
                                            onChange={handleChange}
                                            value={availability}
                                        />
                                        <Form.TextArea
                                            label="Additional Notes/Description"
                                            error={errors.additionalNotes ? { content: errors.additionalNotes } : null}
                                            placeholder="Enter Additional Notes/Description"
                                            name="additionalNotes"
                                            onChange={handleChange}
                                            value={additionalNotes}
                                        />
                                        <Form.Input
                                            label="Tags (e.g., #tag1, #tag2)"
                                            placeholder="Enter Tags"
                                            name="tags"
                                            onChange={handleChange}
                                            value={tags}
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
