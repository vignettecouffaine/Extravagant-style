import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UsuariosComponent.css';
import PropTypes from 'prop-types';
import { useConnectivity } from '../../context/ConnectivityProvider';


const UsuariosComponent = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { isOnline, showNotification } = useConnectivity();


    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        if (!isOnline) {
            const cachedUsuarios = localStorage.getItem('cachedUsuarios');
            if (cachedUsuarios) {
                setUsuarios(JSON.parse(cachedUsuarios));
                showNotification(
                    'Modo Offline',
                    'Mostrando usuarios guardados localmente',
                    'info'
                );
                return;
            }
            showNotification(
                'Sin Conexión',
                'No hay usuarios guardados para mostrar offline',
                'warning'
            );
            return;
        }

        try {
            const response = await axios.get('http://localhost:3000/usuarios');
            setUsuarios(response.data);
            localStorage.setItem('cachedUsuarios', JSON.stringify(response.data));
        } catch (error) {
            console.error("Error fetching usuarios: ", error);
            const cachedUsuarios = localStorage.getItem('cachedUsuarios');
            if (cachedUsuarios) {
                setUsuarios(JSON.parse(cachedUsuarios));
            }
        }
    };

    const handleEditUsuario = (usuario) => {
        if (!isOnline) {
            showNotification(
                'Conexión Requerida',
                'Se necesita conexión a Internet para editar usuarios',
                'warning'
            );
            return;
        }
        setSelectedUsuario(usuario);
        setModalVisible(true);
    };

    const handleDeleteUsuario = async (id) => {
        if (!isOnline) {
            showNotification(
                'Conexión Requerida',
                'Se necesita conexión a Internet para eliminar usuarios',
                'warning'
            );
            return;
        }

        if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            try {
                await axios.delete(`http://localhost:3000/usuarios/${id}`);
                fetchUsuarios();
                showNotification(
                    'Éxito',
                    'Usuario eliminado correctamente',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting usuario: ", error);
                showNotification(
                    'Error',
                    'No se pudo eliminar el usuario',
                    'error'
                );
            }
        }
    };

    const handleSubmit = async (usuario) => {
        if (!isOnline) {
            showNotification(
                'Conexión Requerida',
                'Se necesita conexión a Internet para guardar cambios',
                'warning'
            );
            return;
        }

        try {
            if (selectedUsuario) {
                await axios.put(`http://localhost:3000/usuarios/${selectedUsuario.ID_Usuario}`, usuario);
                showNotification(
                    'Éxito',
                    'Usuario actualizado correctamente',
                    'success'
                );
            } else {
                await axios.post('http://localhost:3000/usuarios', usuario);
                showNotification(
                    'Éxito',
                    'Usuario creado correctamente',
                    'success'
                );
            }
            setModalVisible(false);
            fetchUsuarios();
        } catch (error) {
            console.error("Error saving usuario: ", error);
            showNotification(
                'Error',
                'No se pudieron guardar los cambios',
                'error'
            );
        }
    };

    useEffect(() => {
        fetchUsuarios();

        const intervalId = setInterval(() => {
            if (isOnline) {
                fetchUsuarios();
            }
        }, 30000);

        return () => clearInterval(intervalId);
    }, [isOnline]);


    const getRolNombre = (id) => {
        switch (id) {
            case 1: return 'Usuario';
            case 2: return 'Vendedor';
            case 3: return 'Admin';
            default: return 'Desconocido';
        }
    };

    return (
        <div className="usuarios-container">
            <h1>Usuarios</h1>
            
            <table className="usuarios-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(usuario => (
                            <tr key={usuario.ID_Usuario}>
                                <td>{usuario.ID_Usuario}</td>
                                <td>{usuario.Nombre}</td>
                                <td>{usuario.Apellido}</td>
                                <td>{usuario.Correo}</td>
                                <td>{getRolNombre(usuario.ID_Rol)}</td>
                                <td className="buttons-container-usuario">
                                    <button className="edit-button-usuario" onClick={() => handleEditUsuario(usuario)}>Editar</button>
                                    <button className="delete-button-usuario" onClick={() => handleDeleteUsuario(usuario.ID_Usuario)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            {modalVisible && (
                <UsuarioModal 
                    usuario={selectedUsuario}
                    onClose={() => setModalVisible(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

const UsuarioModal = ({ usuario, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        Nombre: usuario ? usuario.Nombre : '',
        Apellido: usuario ? usuario.Apellido : '',
        Correo: usuario ? usuario.Correo : '',
        Contraseña: usuario ? usuario.Contraseña : '',
        Rol: usuario ? usuario.ID_Rol : ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-usuario">
            <div className="modal-content3">
                <h2>{usuario ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
                <form onSubmit={handleSubmit}>
                    <table className="form-table">
                        <tbody>
                            <tr>
                                <td><label htmlFor="Nombre">Nombre:</label></td>
                                <td><input type="text" id="Nombre" name="Nombre" value={formData.Nombre} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor="Apellido">Apellido:</label></td>
                                <td><input type="text" id="Apellido" name="Apellido" value={formData.Apellido} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor="Correo">Correo:</label></td>
                                <td><input type="email" id="Correo" name="Correo" value={formData.Correo} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor="Contraseña">Contraseña:</label></td>
                                <td><input type="password" id="Contraseña" name="Contraseña" value={formData.Contraseña} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor="Rol">Rol:</label></td>
                                <td>
                                    <select id="Rol" name="Rol" value={formData.Rol} onChange={handleChange}>
                                        <option value="1">Usuario</option>
                                        <option value="2">Vendedor</option>
                                        <option value="3">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="modal-buttons-user">
                        <button className="save-button-user-custom" type="submit">Guardar</button>
                        <button className="cancel-button-user-custom" type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


UsuarioModal.propTypes = {
    usuario: PropTypes.shape({
        Nombre: PropTypes.string,
        Apellido: PropTypes.string,
        Correo: PropTypes.string,
        Contraseña: PropTypes.string,
        ID_Rol: PropTypes.number
    }),
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};
export default UsuariosComponent;

