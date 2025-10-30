import Agency from '../models/agency.model.js';
import User from '../models/user.model.js';

export const getAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find({ active: true }).select('-__v');
    res.status(200).json(agencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgencyById = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.id);
    
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    
    res.status(200).json(agency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgency = async (req, res) => {
  try {
    const {
      name,
      type,
      contactEmail,
      contactPhone,
      address,
      coordinates,
      description,
      logo,
      specialties
    } = req.body;
    
    const newAgency = new Agency({
      name,
      type,
      contactEmail,
      contactPhone,
      address,
      location: {
        type: 'Point',
        coordinates
      },
      description,
      logo,
      specialties
    });
    
    const savedAgency = await newAgency.save();
    res.status(201).json(savedAgency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAgency = async (req, res) => {
  try {
    const {
      name,
      contactEmail,
      contactPhone,
      address,
      coordinates,
      description,
      logo,
      specialties,
      operationalCapacity
    } = req.body;
    
    // Check if user belongs to the agency being updated
    const user = await User.findById(req.user._id);
    if (user.agency.toString() !== req.params.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this agency' });
    }
    
    const updateData = {
      name,
      contactEmail,
      contactPhone,
      address,
      description,
      logo,
      specialties,
      operationalCapacity
    };
    
    // Only update coordinates if provided
    if (coordinates && coordinates.length === 2) {
      updateData.location = {
        type: 'Point',
        coordinates
      };
    }
    
    const updatedAgency = await Agency.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedAgency) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    
    res.status(200).json(updatedAgency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyAgencies = async (req, res) => {
  try {
    const { distance } = req.params;
    const { longitude, latitude } = req.query;
    
    console.log('Finding nearby agencies:', {
      distance,
      longitude,
      latitude
    });
    
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
    
    const maxDistance = parseInt(distance) * 1000; // convert to meters
    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    
    console.log('Search parameters:', {
      maxDistance,
      coordinates
    });
    
    const nearbyAgencies = await Agency.find({
      active: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: maxDistance
        }
      }
    })
    .select('name type contactPhone address location specialties operationalCapacity')
    .limit(20);
    
    console.log(`Found ${nearbyAgencies.length} nearby agencies`);
    
    // Add distance to each agency
    const agenciesWithDistance = nearbyAgencies.map(agency => {
      const agencyObj = agency.toObject();
      const distance = calculateDistance(
        coordinates[1], // latitude
        coordinates[0], // longitude
        agency.location.coordinates[1],
        agency.location.coordinates[0]
      );
      return {
        ...agencyObj,
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
      };
    });
    
    res.status(200).json(agenciesWithDistance);
  } catch (error) {
    console.error('Error finding nearby agencies:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export const getAgenciesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const agencies = await Agency.find({
      type,
      active: true
    }).select('-__v');
    
    res.status(200).json(agencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};