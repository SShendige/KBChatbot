import React from 'react';
import Button from '../../atoms/Button/Button';
import './FolderSelector.css';

const FolderSelector = ({ folders, selectedFolder, onSelectFolder, onClearFilter }) => {
    return (
        <div className="folder-selector">
            <div className="folder-selector-header">
                <h3 className="folder-selector-title">Folders</h3>
                {selectedFolder && (
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={onClearFilter}
                    >
                        Clear
                    </Button>
                )}
            </div>

            <div className="folder-list">
                {folders.length === 0 ? (
                    <div className="folder-empty">No folders yet</div>
                ) : (
                    folders.map((folder) => (
                        <div
                            key={folder}
                            className={`folder-item ${selectedFolder === folder ? 'folder-item-active' : ''}`}
                            onClick={() => onSelectFolder(folder)}
                        >
                            {/* <span className="folder-icon">📂</span> */}
                            <span className="folder-name">{folder}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FolderSelector;
