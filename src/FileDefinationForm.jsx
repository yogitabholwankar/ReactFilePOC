import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
const FileDefinitionForm = () => {
    const initialFormData = {
        fileName: '',
        fileType: '',
        subType: '',
        filePattern: '',
        fileFormat: '',
    };
    const initialColumns = [{ name: '', type: '', description: '' }];
    const [formData, setFormData] = useState(initialFormData);
    const [columns, setColumns] = useState(initialColumns);
    const [jsonData, setJsonData] = useState([]);
    const fileFormats = ['csv', 'xlsx'];
    useEffect(() => {
        fetchFiles();
    }, []);
    const fetchFiles = async () => {
        try {
            const response = await axios.get('http://localhost:5000/all-files');
            setJsonData(response.data);
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error('Failed to fetch saved files.');
        }
    };
    const handleChange = (e, index) => {
        const { name, value } = e.target;
        if (name in formData) {
            setFormData({
                ...formData,
                [name]: value,
            });
        } else {
            const updatedColumns = [...columns];
            updatedColumns[index][name] = value;
            setColumns(updatedColumns);
        }
    };
    const addColumn = () => {
        setColumns([...columns, { name: '', type: '', description: '' }]);
    };
    const removeColumn = (index) => {
        const updatedColumns = [...columns];
        updatedColumns.splice(index, 1);
        setColumns(updatedColumns);
    };
    const validateForm = () => {
        if (!formData.fileName || !formData.fileType || !formData.subType || !formData.filePattern || !formData.fileFormat) {
            toast.error('Please fill out all file details fields.');
            return false;
        }
        for (const column of columns) {
            if (!column.name || !column.type || !column.description) {
                toast.error('Please fill out all column fields.');
                return false;
            }
        }
        return true;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        const formattedData = {
            fileName: formData.fileName,
            fileType: formData.fileType,
            subType: formData.subType,
            filePattern: formData.filePattern,
            fileFormat: formData.fileFormat,
            columns: columns.map((column) => ({
                title: column.name,
                type: column.type,
                description: column.description,
            })),
        };
        try {
            const response = await axios.post('http://localhost:5000/save-json', formattedData);
            toast.success('File generated successfully!');
            fetchFiles(); // Fetch updated JSON data after successful save
            clearForm();
        } catch (error) {
            console.error('Error saving the JSON file', error);
            toast.error('Failed to generate file. Please try again.');
        }
    };
    const clearForm = () => {
        setFormData(initialFormData);
        setColumns(initialColumns);
    };
    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card mt-5 p-4">
                        <h2 className="my-4 text-center">File Format Specification</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-2">
                                <label>File Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="fileName"
                                    value={formData.fileName}
                                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                                />
                            </div>
                            <div className="form-group mb-2">
                                <label>File Pattern:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="filePattern"
                                    value={formData.filePattern}
                                    onChange={(e) => setFormData({ ...formData, filePattern: e.target.value })}
                                />
                            </div>
                            <div className="form-group mb-2">
                                <label>File Format:</label>
                                <select
                                    className="form-control"
                                    name="fileFormat"
                                    value={formData.fileFormat}
                                    onChange={(e) => setFormData({ ...formData, fileFormat: e.target.value })}
                                >
                                    <option value="">Select File Format</option>
                                    {fileFormats.map((format) => (
                                        <option key={format} value={format}>
                                            {format}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group mb-2">
                                <label>File Type:</label>
                                <select
                                    className="form-control"
                                    name="fileType"
                                    value={formData.fileType}
                                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                                >
                                    <option value="">Select File Type</option>
                                    <option value="Expense">Expense </option>
                                    <option value="Revenue">Revenue </option>
                                </select>
                            </div>
                            <div className="form-group mb-2">
                                <label>Sub Type:</label>
                                <select
                                    className="form-control"
                                    name="subType"
                                    value={formData.subType}
                                    onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
                                >
                                    <option value="">Select Sub Type</option>
                                    <option value="Cost">Cost</option>
                                    <option value="Expenditure">Expenditure</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-end mt-4 mb-2">
                                <button type="button" className="btn btn-primary" onClick={addColumn}>
                                    Add Column
                                </button>
                            </div>
                            <h4 className="mt-4 mb-3">Add Columns:</h4>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Column Name</th>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {columns.map((column, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Column Name"
                                                    value={column.name}
                                                    onChange={(e) => handleChange(e, index)}
                                                    name="name"
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    className="form-control"
                                                    value={column.type}
                                                    onChange={(e) => handleChange(e, index)}
                                                    name="type"
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="text">Text</option>
                                                    <option value="number">Number</option>
                                                    <option value="date">Date</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Column Description"
                                                    value={column.description}
                                                    onChange={(e) => handleChange(e, index)}
                                                    name="description"
                                                />
                                            </td>
                                            <td>
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => removeColumn(index)}
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-end mt-4">
                                <button type="submit" className="btn btn-success mr-10" style={{ marginRight: "10px" }}>
                                    Save
                                </button>
                                <button type="button" className="btn btn-secondary ml-5" onClick={clearForm}>
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="mt-5">
                <h2 className="text-center">Saved Files</h2>
                <div className="json-display">
                    {jsonData.map((file, index) => (
                        <div key={index} className="file-item">
                            <h5>File {index + 1}:</h5>
                            <pre>{JSON.stringify(file, null, 2)}</pre>
                        </div>
                    ))}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};
export default FileDefinitionForm;
