import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../firebase";

const containerStyle = {
  width: '100%',
  height: '1000px'
};

const center = {
  lat: 33.7490, // Latitude for Atlanta, Georgia
  lng: -84.3880 // Longitude for Atlanta, Georgia
};

const infoWindowStyle = {
  padding: '8px',
  maxWidth: '300px', // Increase maxWidth if necessary
  textAlign: 'center',
  borderRadius: '8px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const titleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '4px',
};

const textStyle = {
  fontSize: '14px',
  margin: '2px 0',
};

const imageStyle = {
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '8px',
};

const smallTextStyle = {
  ...textStyle,
  fontSize: '12px',
};

const Map = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const markersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Markers data fetched:", markersData); // Log marker data
        setMarkers(markersData);
      } catch (error) {
        console.error("Error fetching markers:", error); // Log any errors
      }
    };

    fetchMarkers();
  }, []);

  const handleCallPrompt = (contact) => {
    window.prompt(`Call ${contact}`);
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyDiyzlScpC-8pjM5LvQaHgvMHknDNfvYHQ">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}> {/* Updated zoom to 10 */}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            onClick={() => setSelectedMarker(marker)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={infoWindowStyle}>
              <h2 style={titleStyle}>{selectedMarker.name}</h2>
              {selectedMarker.img && <img src={selectedMarker.img} alt={selectedMarker.name} style={imageStyle} />}
              <p style={textStyle}>Email: <a href={`mailto:${selectedMarker.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>{selectedMarker.email}</a></p>
              <p style={textStyle}>Contact: <button onClick={() => handleCallPrompt(selectedMarker.contact)} style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer', color: 'inherit' }}>{selectedMarker.contact}</button></p>
              <p style={textStyle}>Business Type: {selectedMarker.businessType}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
