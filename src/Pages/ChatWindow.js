import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";


const ChatWindow = () => {


    const {userId} = useParams(); // URL 에서 userId 가져옴
    const [messages, setMessages] = useState([]);// 채팅 메세지 상태 관리
    const [messageInput, setMessageInput] = useState('');// 입력된 메세지 상태 관리
    const [webSocket, setWebSocket] = useState(null);// webSocket 상태 관리
    const navigate = useNavigate();

    useEffect(() => {

        // useEffect의  return 발동 시점 -> 언마운트시 !
        // 최초 마운트 시에만 동작 시킬꺼임
        const wsProtocol = window.location.protocol === "https:"? "wss://":"ws://"; // s 가 붙으면 보안 되어있다는 뜻.
        const wsUrl = `${wsProtocol}localhost:8080/chattingServer`;
        const ws = new WebSocket(wsUrl);


        // 소켓 연결이 성공적으로 되었을 때 실행될 함수
        ws.onopen = () => {
            console.log("WebSocket 연결 성공");
            const initalMessage = "webSocket 연결 성공 !";
            setMessages(prev => [...prev, {type:'info', message : initalMessage}]);
            ws.send(JSON.stringify({type:'join', userId})); // 아까 백에서 만들었던 그거 찍어줄라고.
        };

        // 메세지 수신 시 실행될 함수
        ws.onmessage = (event) => {
            console.log("서버로부터 메세지 수신 : " + event.data);
            const message = event.data;
            setMessages(prev => [...prev, {type:'received', message}]);
        };

        // 연결이 닫혔을 때 실행되는 함수
        ws.onclose= () => {
            console.log("Socket 서버와의 연결이 종료 되었씁니다.");
            const closingMessage = "Socket 서버 연결 종료";
            setMessages(prev => [...prev, {type:'info', message:closingMessage}]);

        }

        // 에러 발생 시 실행되는 함수
        ws.onerror = (error)=> {
            console.log("error : " + error);
        }

        setWebSocket(ws);
        return(()=>{
            if(ws){
                ws.send(JSON.stringify({type:'leave', userId}));
                ws.close();
            }
        });


    },[])

    const sendMessage = () => {
        if(webSocket && webSocket.readyState === webSocket.OPEN){
            const trimmedMessage = messageInput.trim();
            if(trimmedMessage !== ''){
                webSocket.send(JSON.stringify({type:'message', userId,message: trimmedMessage}));
                 // userId 는 가져온 값이니까, 일케 넣어주면 키 value 형태로 자동으로 들어간다. 변수명/내용 이 자동으로 키 벨류로 들어간다.
                setMessages(prev => [...prev, {type:'sent', message: trimmedMessage}]); // 내가 보낸건 sent 
                // prev 는 자신의 최신상태를 가지고 옴.. 배열임
                setMessageInput('');
            }
        }else{
            console.log("웹 소켓이 연결되지 않았씁니다.")
        }
    }
    const handlerKeyPress = (event) => {
        if(event.key === "Enter"){
            sendMessage();
        }

    }
    const handleBackToMain = () => {
        navigate("/");
    }

    return(
        <>
        <div className="chat-container">
            <h2>webSocket 채팅</h2>
            <div
            // 메세지 받는 디브
                id="chatWindow"
                className="chat-window"
                style={{
                    border: '1px solid #ccc',
                    width: '380px',
                    height: '400px',
                    overflowY: 'scroll',
                    padding: '10px',
                    backgroundColor: '#fff',
                  }}>
                    {messages.map((msg, index)=> {
                        return(

                        <div key={index}
                            className={`message${msg.type}`}
                            style={{
                                textAlign: msg.type === 'sent' ? 'right' : 'left',
                                marginTop: '5px',
                                color: msg.type === 'sent' ? 'blue' : '#f32f00',
                              }}
                              
                            >{msg.message}</div>
                        )

                        })}
                </div>
                <div className="input-container">
                    {/* 입력한 메세지를 서버로 보내는 */}
                    <input
                        type="text"
                        id="chatMessage"
                        placeholder="메세지 입력"
                        value={messageInput}
                        onChange={e=>setMessageInput(e.target.value)}
                        // 특정 키를 눌렀을 때
                        onKeyDown={handlerKeyPress} // 엔터로 메세지 보내는거랑 비슷
                        />
                        <button id="sendBtn" onClick={sendMessage}>전송</button>
                        <button onClick={handleBackToMain}>메인으로 돌아가기</button>
                </div>
        </div>
        </>
    )

}
export default ChatWindow;