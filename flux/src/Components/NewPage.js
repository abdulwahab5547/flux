import React, { useEffect, useState, useCallback, useRef} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';
import Overlay from './Overlay';
import './NewPage.css'; // Ensure this CSS file contains your styling
// import ContentEditor from './ContentEditor';

function NewPage({ updatePage, colors }) {
    const { slug } = useParams();
    // const location = useLocation();
    const [pageData, setPageData] = useState({ title: '', content: '', iconClass: 'fa-solid fa-file' });
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPageData = async () => {
            const token = localStorage.getItem('authToken');

            if (!token) {
                console.error('No token found');
                toast.info('Please log in to use all features.');
                return;
            }

            try {
                const response = await axios.get(`/api/pages/${slug}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data) {
                    setPageData({
                        title: response.data.title,
                        content: response.data.content, // Set content directly as text
                        iconClass: response.data.iconClass
                    });
                    setNewContent(response.data.content); // Set content in textarea
                    setNewTitle(response.data.title);
                } else {
                    toast.error('Page data not found.');
                }
            } catch (error) {
                console.error('Error fetching page data:', error);
                toast.error('Error fetching page data.');
            }
        };

        fetchPageData();
    }, [slug]);
    

    // Debounced save function
    const debouncedSave = useCallback(
        debounce(async (updatedField) => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const updatedPage = {
                    ...pageData,
                    ...updatedField // Update content directly as text
                };

                const response = await axios.put(`/api/pages/${slug}`, updatedPage, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 200) {
                    setPageData(updatedPage);
                    setIsLoading(false);
                    toast.success('Changes saved!');
                } else {
                    throw new Error('Failed to update page');
                }
            } catch (error) {
                console.error('Error updating page:', error);
                toast.error('Error updating page content. Please try again.');
                setIsLoading(false);
            }
        }, 1000),
        [pageData, slug]
    );

    // const handleContentChange = (rawContent) => {
    //     setNewContent(rawContent);
    //     debouncedSave({ content: rawContent });
    // };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setNewTitle(newTitle);
        debouncedSave({ title: newTitle });
    };

    const handleContentChange = (e) => {
        const updatedContent = e.target.value;
        setNewContent(updatedContent);
        debouncedSave({ content: updatedContent });
    };


    // Images

    const [selectedFiles, setSelectedFiles] = useState([]); // Change to array

    const handleUpload = async (e) => {
        e.preventDefault(); 
    
        try {
            const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
    
            if (!token) {
                console.error('No token found');
                toast.info('Please log in to upload an image.');
                return;
            }
    
            if (selectedFiles.length === 0) {
                toast.info('Please select files to upload.');
                return;
            }
    
            // Create an array to hold upload promises
            const uploadPromises = selectedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
    
                // Post the file to the server
                const response = await axios.post(`/api/pages/${slug}/upload-image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
    
                // Return the image URL from the response
                return response.data.imageUrl;
            });
    
            // Wait for all uploads to complete
            const imageUrls = await Promise.all(uploadPromises);
    
            // Update the state with the new image URLs
            setImages((prevImages) => [...prevImages, ...imageUrls]);
    
            // Reset file input and state
            setSelectedFiles([]);
            document.querySelector('.profile-pic-upload-input').value = ''; // Reset the file input
    
            toast.success('Image uploaded!');
        } catch (error) {
            // Enhanced error logging to give more context about the issue
            if (error.response) {
                console.error('Server responded with an error:', error.response.data);
            } else if (error.request) {
                console.error('Request was made but no response received:', error.request);
            } else {
                console.error('Error setting up the request:', error.message);
            }
            toast.error('There was an error uploading your images!');
        }
    };    
    
    const handleFileChange = (e) => {
        console.log('Selected files:', e.target.files);
        setSelectedFiles(Array.from(e.target.files)); // Convert FileList to array
    };
    

// Image show

const [selectedImage, setSelectedImage] = useState(null);
const [images, setImages] = useState([]);

const handleOverlayClose = () => {
    setSelectedImage(null);
    setIsOverlayVisible(false);
};

useEffect(() => {
    const fetchImages = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await axios.get(`/api/pages/${slug}/images`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const fetchedImages = response.data.images;
                // Ensure fetchedImages is an array
                setImages(Array.isArray(fetchedImages) ? fetchedImages : [fetchedImages]);
            } else {
                console.error('Failed to fetch images');
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    fetchImages();
}, [slug]);
    

    const [isImageOverlayVisible, setIsImageOverlayVisible] = useState(false);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [overlayContent, setOverlayContent] = useState(null);
    
    const handleImageClick = (url) => {
        setSelectedImage(url);
        toggleOverlay(<img src={url} alt="Selected" className='overlay-image' />);
    };

    // Function to close the image overlay
    const handleImageOverlayClose = () => {
        setSelectedImage(null);
        setIsOverlayVisible(false);
    };

    const toggleOverlay = (content) => {
        setOverlayContent(content);
        setIsOverlayVisible(prev => !prev);
    };

    const toggleOverlayWithContent = () => {
        toggleOverlay(getAddImageOverlayContent());
    };

    const getAddImageOverlayContent = () => (
        <div className='p-3'>
            <p className="pb-3 m-0 profile-text">Add image</p>
            <div className='d-flex first-and-last align-items-center'>
                <div>
                    <input
                        style={{ color: colors.mainText, backgroundColor: colors.mainBackground }}
                        type="file"
                        className='profile-pic-upload-input'
                        onChange={handleFileChange}
                        multiple // Allow multiple file selection if needed
                    />
                </div>
                <button className='normal-btn' onClick={handleUpload}>Upload</button>
            </div> 
        </div>
    );
    

    return (
        <div className='newpage-padding-left'>
            <div className='icon-and-title-container'>
                <div className='newpage-main-icon py-3'>
                    <i className={pageData.iconClass || 'fa-solid fa-file'}></i>
                </div>
                
                <h2 className='py-2'>
                    <input
                        style={{ color: colors.mainText, backgroundColor: colors.mainBackground}}
                        className='newpage-title-input heading-font'
                        type="text"
                        value={newTitle}
                        onChange={handleTitleChange}
                    />
                </h2>
            </div>

            <div className='newpage-content-container'>
                <textarea
                    className='para-text'
                    value={newContent}
                    onChange={handleContentChange}
                    placeholder="Edit your content here..."
                    rows={10}
                    cols={50}
                    disabled={isLoading}
                    style={{ width: '100%', fontSize: '15px', color: colors.mainText, backgroundColor: colors.mainBackground }}
                />
            </div>

            <div className='newpage-image-container py-2'>
                <p className='upcoming-task-date heading-font m-0 pb-2'>Add images</p>
                <div className='add-image-icon hover-icon p-3'
                style={{color: colors.sidebarText, backgroundColor: colors.sidebarBackground}}
                onClick={toggleOverlayWithContent}>
                    
                    <div className='text-center'>
                        <i className='fa-solid fa-plus p-2'></i>
                        <p className="pb-2 m-0 profile-text">Add image</p>
                    </div>
                    
                </div>
            </div>
            
            
            <div className='newpage-image-display pt-3'>
                
                <div className='px-2 pt-3'>
                <p className='upcoming-task-date heading-font m-0 pb-2'>Images</p>
                <div className='row m-0'>
                    {images.length > 0 ? (
                        images.map((url, index) => (
                            <div className='col-sm-4 col-6 col-md-3 col-lg-2 pb-4 px-0 newpage-img-div' key={index}>
                                <img
                                    className='img-fluid p-2'
                                    src={url}
                                    onClick={() => handleImageClick(url)}
                                    style={{ cursor: 'pointer'}}
                                />
                            </div>
                        ))
                    ) : (
                        <p className='p-0 m-0'>No images available.</p>
                    )}
                </div>
                </div>
            </div>


            {/* <p>Page slug: {slug}</p> */}
            {/* <div className='py-1'>
                <ContentEditor
                colors={colors}
                initialContent={newContent}
                // value={newContent}
                onContentChange={handleContentChange} // Pass handleContentChange directly
                />
            </div> */}
            
            <div className='status-part-container'>
                <div className='status-icon-div hover-icon'>
                    <i className={`status-icon fa-solid p-2 ${isLoading ? 'fa-spinner' : 'fa-check'}`}></i>
                    <span className="status-tooltip">
                        {isLoading ? 'Saving changes' : 'Changes saved'}
                    </span>
                </div>
            </div>
            
            <Overlay
                isVisible={isOverlayVisible}
                onClose={handleImageOverlayClose}
                colors={colors}
            >
                {overlayContent}
            </Overlay>
            
        </div>
    );
}

export default NewPage;
