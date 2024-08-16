import React, { useState, useEffect, useRef} from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './NewPage.css';

function ContentEditor({ colors, initialContent, onContentChange }) {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const editorStateRef = useRef(editorState);

    useEffect(() => {
    if (initialContent) {
        let contentState;
        try {
            const parsedContent = JSON.parse(initialContent);
            contentState = convertFromRaw(parsedContent);
        } catch (error) {
            console.error('Error parsing content as JSON:', error);
            contentState = ContentState.createFromText(initialContent);
        }

        setEditorState(EditorState.createWithContent(contentState));
    }
    }, [initialContent]);
    

    const handleEditorChange = (newState) => {
        editorStateRef.current = newState; // Update the ref
        setEditorState(newState);
    
        const contentState = newState.getCurrentContent();
        const rawContent = convertToRaw(contentState);
    
        onContentChange(JSON.stringify(rawContent));
    };

    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            handleEditorChange(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const toggleBlockType = (blockType) => {
        handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
    };

    return (
        <div style={{ color: colors.mainText, backgroundColor: colors.mainBackground }}>
            <div className='d-flex editor-styling-button-div'>
                <div className="normal-btn-wrapper">
                    <button className='normal-btn' onClick={() => toggleBlockType('header-two')}>H2</button>
                    <span className='styling-button-tooltip'>Select a line below to apply H2 style</span>
                </div>
                <div className="normal-btn-wrapper">
                    <button className='normal-btn' onClick={() => toggleBlockType('header-three')}>H3</button>
                    <span className='styling-button-tooltip'>Select a line below to apply H3 style</span>
                </div>
                <div className="normal-btn-wrapper">
                    <button className='normal-btn' onClick={() => toggleBlockType('header-four')}>H4</button>
                    <span className='styling-button-tooltip'>Select a line below to apply H4 style</span>
                </div>
                <div className="normal-btn-wrapper">
                    <button className='normal-btn' onClick={() => handleEditorChange(RichUtils.toggleInlineStyle(editorState, 'BOLD'))}>Bold</button>
                    <span className='styling-button-tooltip'>Select text to apply Bold</span>
                </div>
                <div className="normal-btn-wrapper">
                    <button className='normal-btn' onClick={() => handleEditorChange(RichUtils.toggleInlineStyle(editorState, 'ITALIC'))}>Italic</button>
                    <span className='styling-button-tooltip'>Select text to apply Italic</span>
                </div>
            </div>

            
            <div className="editor pt-3">
                <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    handleKeyCommand={handleKeyCommand}
                    direction="ltr" 
                />
            </div>
        </div>
    );
}

export default ContentEditor;
