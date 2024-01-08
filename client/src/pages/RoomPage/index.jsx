/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react"
import rough from 'roughjs';

import "./index.css"
import { WhiteBoard } from "../../components/WhiteBoard";

export const RoomPage = ({ user, socket }) => {
    const canvasRef = useRef(null)
    const ctxRef = useRef(null)

    const [tool, setTool] = useState("pencil") // Select tool
    const [color, setColor] = useState("black") // select color
    const [elements, setElements] = useState([]) // array of different "drawing events"(elements)
    const [removedElements, setRemovedElements] = useState([]) // array of undo elements
    const [usersInRoom, setUsersInRoom] = useState([]); // array of users in a room
    const [isUserpanel, setIsUserPanel] = useState(false);
    const [isChatBox, setIsChatBox] = useState(false);

    // update users state
    useEffect(() => {
        socket.on("userIsJoined", ({ users }) => {
            console.log(users);
            setUsersInRoom(users);
        })
    }, [socket])

    const handleClearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setElements([]);
    }

    //handle undo
    const handleUndo = () => {
        setRemovedElements((prevElm) => {
            return [...prevElm, elements[elements.length - 1]]
        })
        setElements((prevElm) => {
            console.log(prevElm.length);
            return prevElm.slice(0, prevElm.length - 1)
        })
        console.log(elements.length);
    }

    //handle redo
    const handleRedo = () => {
        setElements((prevElm) => {
            return [...prevElm, removedElements[removedElements.length - 1]]
        })
        setRemovedElements((prevElm) => {
            return prevElm.slice(0, prevElm.length - 1)
        })
    }

    return (
        // main div of canvas page
        <div className="mainCanvas">
            {/* Header */}
            <h1 className="text-center py-2">White Board Sharig App<span className="text-primary">[Users Online : {usersInRoom.length}]</span></h1>

            {/* Users Panel */}
            {isUserpanel &&
                <div className="main-panel d-flex flex-column justify-content-start border border-black rounded-4">
                    <div className="d-flex justify-content-end my-2 me-2">
                        <button className="btn btn-primary" onClick={() => { setIsUserPanel(false); setIsChatBox(false) }}>X</button>
                    </div>
                    <div className="users-box container-fluid h-100">
                        <h4 className="text-center text-danger border border-dark py-1">Peoples Online : {usersInRoom.length}</h4>
                        {usersInRoom.map(usr => <>
                            {(usr.userId === user.userId) ? <p>{usr.name + "(You)"}</p> : <p>{usr.name}</p>}
                        </>)}
                    </div>
                </div>
            }

            {isChatBox &&
                <div className="main-panel d-flex flex-column justify-content-start border border-black rounded-4">
                    <div className="d-flex justify-content-end my-2 me-2">
                        <button className="btn btn-primary" onClick={() => { setIsUserPanel(false); setIsChatBox(false) }}>X</button>
                    </div>
                    <div className="users-box container-fluid h-100">
                        <h4 className="text-center text-danger border border-dark py-1">Chat</h4>

                    </div>
                </div>
            }

            {/* toolbar implementation */}
            <div className="border col-md-10 mx-auto mb-3 d-flex align-items-center justify-content-between">

                {/* Choose drawing element start */}
                <div className="d-flex col-md-2 justify-content-between gap-1">
                    <div className="d-flex gap-1 align-items-center">
                        <label htmlFor="pencil">Pencil</label>
                        <input
                            type="radio"
                            name="tool"
                            id="pencil"
                            value="pencil"
                            checked={tool === "pencil"}
                            className="mt-1"
                            onChange={(e) => setTool(e.target.value)}
                        ></input>
                    </div>
                    <div className="d-flex gap-1 align-items-center">
                        <label htmlFor="line">Line</label>
                        <input
                            type="radio"
                            name="tool"
                            id="line"
                            value="line"
                            checked={tool === "line"}
                            className="mt-1"
                            onChange={(e) => setTool(e.target.value)}
                        ></input>
                    </div>
                    <div className="d-flex gap-1 align-items-center">
                        <label htmlFor="rect">Rectrangle</label>
                        <input
                            type="radio"
                            name="tool"
                            id="rect"
                            value="rect"
                            checked={tool === "rect"}
                            className="mt-1"
                            onChange={(e) => setTool(e.target.value)}
                        ></input>
                    </div>
                </div>

                {/* Color picker */}
                <div className="col-md-3">
                    <div className="d-flex align-items-center">
                        <label htmlFor="color">Select Color: </label>
                        <input
                            type="color"
                            id="color"
                            className="mt-1 ms-3"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        ></input>
                    </div>
                </div>

                {/* Undo and Redo Button */}
                <div className="col-md-3 d-flex gap-2">
                    <button
                        className="btn btn-primary mt-1 "
                        onClick={() => handleUndo()}
                        disabled={elements.length <= 0}
                    >
                        Undo
                    </button>
                    <button
                        className="btn btn-outline-primary mt-1 "
                        onClick={() => handleRedo()}
                        disabled={removedElements.length <= 0}
                    >
                        Redo
                    </button>
                </div>

                {/* Clear Canvas Button */}
                <div className="col-md-2">
                    <button onClick={handleClearCanvas} className="btn btn-danger">Clear canvas</button>
                </div>
            </div>

            {/* Whiteboard Implementation */}
            <div className="canvas-box col-md-8 h-50 mx-auto">
                <WhiteBoard
                    canvasRef={canvasRef}
                    ctxRef={ctxRef}
                    elements={elements}
                    setElements={setElements}
                    tool={tool}
                    color={color}
                    socket={socket}
                    user={user}
                />
            </div>

            {/* Utis Button */}
            <div className="bg-dark mt-2 d-flex justify-content-end align-items-center">
                <button
                    className="btn btn-outline-info my-2 me-3"
                    onClick={(e) => { e.preventDefault(); setIsUserPanel(true); setIsChatBox(false); console.log(`${isUserpanel} + ${isChatBox}`)}}
                >
                    Peoples
                </button>
                <button
                    className="btn btn-outline-info my-2 me-3"
                    onClick={(e) => { e.preventDefault(); setIsChatBox(true); setIsUserPanel(false); console.log(`${isUserpanel} + ${isChatBox}`) }}
                >
                    Chat
                </button>
            </div>
        </div>
    )
}
