import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';

import { MdEdit, MdDelete } from 'react-icons/md';

import Button from '../../Components/Button';
import Alert from '../../Components/Alert';
import ModalDetail from '../../Components/ModalDetail';

import api from '../../services/api';

import userImgDefault from '../../assets/default-user-image.png'
import './styles.css'

function Home (){

    const [navers, setNavers] = useState();

    const [alertConfig, setAlertConfig] = useState({});

    const [modalVisible, setModalVisible] = useState(false);
    const [naverDetail, setNaverDetail] =useState('');

    const history = useHistory();

    const showAlert = (title, message, buttons = null) => {

        const alertConfig = {
            visible: true,
            title,
            message,
            buttons,
        }
        setAlertConfig(alertConfig);
    }

    const handleNewNaver = () => {
        history.replace('/new')
    }

    function handleRequestConfirm(naver){
        showAlert(
        "Excluir Naver",
        "Tem certeza que deseja excluir este Naver?", 
        [<Button type="outlinedButton" onClick={()=>{setAlertConfig(!alertConfig.visible)}}>Cancelar</Button>, 
        <Button onClick={()=>{handleDelete(naver)}}>Excluir</Button>], 
        );
    }

    const handleDelete = (naver) => {
       
        api.delete(`/navers/${naver.id}`, {
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        })
        .then(response => {

            showAlert("Naver excluído", "Naver excluído com sucesso!");

            const attNavers = navers.filter(arrNaver => {
                if (arrNaver.id !== naver.id) {
                    return arrNaver;
                }  
            })

            setNavers(attNavers);
            setModalVisible(false);
        })
    }

    const handleEdit = (naver) => {
        history.replace({
            pathname: '/edit',
            state: naver
        })
    }

    const handleShowNaver = naver => {

        api.get(`/navers/${naver.id}`, {
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        })
        .then(response => {
            setNaverDetail(response.data);
            setModalVisible(true);
        })
       
    }

    useEffect(()=> {
        const token = sessionStorage.getItem('token');
        api.get('/navers', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            setNavers(response.data);
        })
        .catch(error => {
            const {errorCode, name, message} = error.response.data;
            showAlert(`Request Error ${errorCode}`, `${name} - ${message}`);
        })

    },[])

    return (
        <div className="container">
            <div className="optionsBar">
                <h1>Navers</h1>
                <Button onClick={()=> handleNewNaver()}>Adicionar Naver</Button>
            </div>

            <div className="naverContent">        
                {navers?.map(naver => (
                    <div className="naverCard" key={naver.id} onClick={e => {handleShowNaver(naver)}}>
                        <img src={naver.url} onError={(e)=>{e.target.onerror = null; e.target.src=userImgDefault}}  alt={naver.name}></img>

                        <div className="naverDescription">
                            <h3>{naver.name}</h3>
                            <span>{naver.job_role}</span>
                        </div>
    
                        <div className="naverOptions">   
                            <a onClick={()=>{handleRequestConfirm(naver)}}><MdDelete size={18} /> </a> 
                            <a onClick={()=>{handleEdit(naver)}}><MdEdit size={18} /> </a> 
                        </div>
                    </div>
                    
                ))}
            </div>

            
            <ModalDetail
                visible={modalVisible} setVisible={setModalVisible} 
                naver={naverDetail}
                handleDelete={handleRequestConfirm}
                handleEdit={handleEdit}
            />

            <Alert
                messageTitle={alertConfig.title} 
                messageText={alertConfig.message}
                buttons={alertConfig.buttons}
                visible={alertConfig.visible} setVisible={setAlertConfig} 
            />
        </div>
    )
}

export default Home;