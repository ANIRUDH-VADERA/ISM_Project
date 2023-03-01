// Message Types available
messageTypes={LEFT:"left", RIGHT:"right",LOGIN:"login"};
// messages will contain objects each containing {author,date,type,content}
const messages=[]
// CHAT
const chatWindow= document.querySelector(".chat"); 
const messageList=document.querySelector(".message-list");
const messageInput=document.querySelector(".messageInput");
const imageInputButton=document.querySelector(".imageInput");
const sendBtn2=document.querySelector(".sendBtn2");
const imageInput = document.getElementById("getFile");
// LOGIN
let username="";
const usernameInput=document.querySelector(".userNameInput");
const loginBtn=document.querySelector(".loginBtn");
const loginWindow=document.querySelector(".login");


imageInputButton.addEventListener("click",(e)=>{  
    e.preventDefault();
    imageInput.click();
    setTimeout(()=>{
        imageInputButton.innerHTML = imageInput.files[0].name;
    },3000)
})

var socket=io();

socket.on("message",(message)=>{
    console.log(message);
    if(message.type!==messageTypes.LOGIN)
    {
        if(message.author===username)
        {
            message.type=messageTypes.RIGHT;
        }
        else
        {
            message.type=messageTypes.LEFT;
        }
    }
    messages.push(message);
    displayMessages();
    chatWindow.scrollTop=chatWindow.scrollHeight;
});

socket.on("base64 file",(fileInfo)=>{
    const image = fileInfo.data;
    if(fileInfo.author == username){
        fileInfo.type = messageTypes.RIGHT;
    }
    else{
        fileInfo.type = messageTypes.LEFT;
    }
    messages.push(fileInfo);
    displayMessages();
    chatWindow.scrollTop=chatWindow.scrollHeight;
});

// we take the message, and return the HTML
function createMessageHtml(message)
{
    if(message.type===messageTypes.LOGIN)
    {
        return '<p class="secondary-text text-center mb2">'+message.author+' has joined the chat</p>';
    }
    else
    {
        if(message.type===messageTypes.LEFT)
        {
            if(message.flag == 1){
                return '<div class="message message-left"><div class="message-details flex"><p class="message-author">' + message.author + '</p><p class="message-date">'+message.date+'</p></div><img class="message-content" src = "'+message.data+'"  /></div>';
            }
            else if(message.flag == 0){
                return '<div class="message message-left"><div class="message-details flex"><p class="message-author">' + message.author + '</p><p class="message-date">'+message.date+'</p></div><p class="message-content">'+message.content+'</p></div>';
            }
            else{
                return '<div class="message message-left"><div class="message-details flex"><p class="message-author">' + message.author + '</p><p class="message-date">'+message.date+'</p></div><img class="message-content" src = "'+message.imageData+'"  /></div>';
            }
        }
        else
        {
            if(message.flag == 1){
                return '<div class="message message-right"><div class="message-details flex"><p class="message-author"></p><p class="message-date">'+message.date+'</p></div><img class="message-content" src = "'+message.data+'" /></div>'; 
            }
            else if(message.flag == 0){
                return '<div class="message message-right"><div class="message-details flex"><p class="message-author"></p><p class="message-date">'+message.date+'</p></div><p class="message-content">'+message.content+'</p></div>';
            }
            else{
                return '<div class="message message-right"><div class="message-details flex"><p class="message-author"></p><p class="message-date">'+message.date+'</p></div><img class="message-content" src = "'+message.imageData+'" /></div>'; 
            }
        }
        
    }
}

function displayMessages()
{
    const messagesHTML=messages.map((message)=>createMessageHtml(message)).join("");
    messageList.innerHTML=messagesHTML;
}


// loginBtn
loginBtn.addEventListener("click",(event)=>{
    event.preventDefault();
    if(!usernameInput.value)
    {
        return console.log("must supply a username");
    }
    username=usernameInput.value;
    loginWindow.classList.add("hidden");
    chatWindow.classList.remove("hidden");
    sendMessage(
        {
            author: username,
            type: messageTypes.LOGIN
        }
    );
});


sendBtn2.addEventListener("click",(event)=>{
    event.preventDefault();
    const date=new Date();
    const day=date.getDate();
    const year=date.getFullYear();
    const month=('0'+(date.getMonth()+1)).slice(-2);
    const dateString=month+'/'+day+'/'+year;
    if(!messageInput.value)
    {
        if(imageInput.value){
            const file = imageInput.files[0];
            const reader = new FileReader();

            reader.addEventListener('load',(event) => {
                socket.emit('base64 file',{
                    flag : 1,
                    name: file.name,
                    author: username,
                    date: dateString,
                    data: event.target.result
                },(status)=>{
                    console.log(status);
                })
            })
            
            reader.readAsDataURL(file);
            imageInput.value="";
        }
        else{
            return console.log("must supply a message");
        }
    }
    else if(!imageInput.value)
    {
        console.log(messageInput.value);
        const message={
            flag : 0,
            author: username,
            date: dateString,
            content : messageInput.value,
        }
        sendMessage(message);
        messageInput.value="";
    }
    else{
        const file = imageInput.files[0];
        const reader = new FileReader();
        messageInputTextData = messageInput.value;


        reader.addEventListener('load',(event)=>{
            const toSendMessage = {
                flag : 2,
                imageName: file.name,
                author: username,
                date: dateString,
                imageData: event.target.result,
                textData: messageInputTextData
            }
            socket.emit('base64 file',toSendMessage,(status)=>{
                console.log(status);
            })
        })

        reader.readAsDataURL(file);
        imageInput.value="";
        messageInput.value="";

    }
    
});

function sendMessage(message)
{
    socket.emit("message",message);
}

