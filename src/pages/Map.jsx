import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../firebase";

const containerStyle = {
  width: '100%',
  height: '1000px'
};

const center = {
  lat: 39.8283,
  lng: -98.5795
};

const infoWindowStyle = {
  padding: '10px',
  maxWidth: '200px',
  textAlign: 'center',
  borderRadius: '8px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const titleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '8px',
};

const textStyle = {
  fontSize: '14px',
  margin: '4px 0',
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

  return (
    <LoadScript googleMapsApiKey="AIzaSyDiyzlScpC-8pjM5LvQaHgvMHknDNfvYHQ">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={4}>
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
              <p style={textStyle}>Email: {selectedMarker.email}</p>
              <p style={textStyle}>Contact: {selectedMarker.contact}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;
