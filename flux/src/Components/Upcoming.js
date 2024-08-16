
import axios from 'axios';
import React, { useEffect, useState, useRef} from 'react';
import ContentEditor from './ContentEditor';

function Upcoming({ colors }) {
    // const [content, setContent] = useState('{}'); // Initialize with empty content

    // Fetch the initial content when the component mounts
    // useEffect(() => {
    //     const fetchContent = async () => {
    //         try {
    //             const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

    //             if (!token) {
    //                 console.error('No token found');
    //                 return;
    //             }

    //             const response = await axios.get('http://localhost:8000/api/content', {
    //                 headers: {
    //                     Authorization: `Bearer ${token}` // Include token in Authorization header
    //                 }
    //             });

    //             setContent(response.data.content || '{}'); // Set fetched content
    //         } catch (error) {
    //             console.error('Error fetching content:', error);
    //         }
    //     };

    //     fetchContent();
    // }, []);

    // Save the content
    // const handleContentChange = async (newContent) => {
    //     try {
    //         const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

    //         if (!token) {
    //             console.error('No token found');
    //             return;
    //         }

    //         await axios.post('http://localhost:8000/api/content', 
    //             { content: newContent },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}` // Include token in Authorization header
    //                 }
    //             }
    //         );

    //         console.log('Content saved successfully');
    //     } catch (error) {
    //         console.error('Error saving content:', error);
    //     }
    // };

    // Testing

    

    const [showContentTooltip, setShowContentTooltip] = useState(false);
    const tooltipRef = useRef(null);
    const iconRef = useRef(null);
    const [content, setContent] = useState([]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                tooltipRef.current && 
                !tooltipRef.current.contains(event.target) && 
                !iconRef.current.contains(event.target)
            ) {
                setShowContentTooltip(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleContentAdd = (tag) => {
        setContent([...content, { tag, content: '' }]);  // Add empty content initially
        setShowContentTooltip(false);
    };

    const handleContentChange = (index, newContent) => {
        const updatedContent = content.map((item, i) => 
            i === index ? { ...item, content: newContent } : item
        );
        setContent(updatedContent);
    };

    return (
        <div className="upcoming page">
            <h2 className='heading-font'>Upcoming</h2>
            <div>
                {/* <ContentEditor
                    colors={colors}
                    initialContent={content}
                    onContentChange={handleContentChange}
                /> */}
                <div className='my-content-editor new-page-content'>
                <div className='my-content-editor new-page-content'>
        <div className='page-content-div-container'>
            <div className='page-content-div d-flex align-items-center'>
                <div>
                    <div
                        className='add-content-icon hover-icon px-1'
                        ref={iconRef}
                        onClick={() => setShowContentTooltip(!showContentTooltip)}
                    >
                        <i className='fa-solid fa-plus'></i>
                    </div>
                    {showContentTooltip && (
                        <div className="add-content-tooltip" ref={tooltipRef}
                            style={{ color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}
                        >
                            <div className='hover-icon px-3' onClick={() => handleContentAdd('p')}>Text</div>
                            <div className='hover-icon px-3' onClick={() => handleContentAdd('h1')}>Heading 1</div>
                            <div className='hover-icon px-3' onClick={() => handleContentAdd('h2')}>Heading 2</div>
                            <div className='hover-icon px-3' onClick={() => handleContentAdd('h3')}>Heading 3</div>
                            <div className='hover-icon px-3' onClick={() => handleContentAdd('h4')}>Heading 4</div>
                            <div className='hover-icon px-3' onClick={() => handleContentAdd('h5')}>Heading 5</div>
                            <div className='hover-icon px-3' onClick={() => handleContentAdd('h6')}>Heading 6</div>
                        </div>
                    )}
                </div>

                <div>
                    Add content
                </div>
            </div>
            {/* Render created content below the "Add content" text */}
            <div className='created-content'>
                {content.map((item, index) => {
                    const Tag = item.tag;
                    return (
                        <div key={index} className="content-item">
                            <Tag 
                                contentEditable
                                suppressContentEditableWarning
                                onInput={(e) => handleContentChange(index, e.currentTarget.textContent)}
                                dir="ltr"
                            >
                                {item.content}
                            </Tag>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
    </div>
            </div>
        </div>
    );
}

export default Upcoming;
