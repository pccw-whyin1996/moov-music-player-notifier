module.exports = function(io){

    function log(msg){
        console.log("satellite: " + msg);
    }

    function logAvailableClients(){
        log("no of socket client: " + clients.length);
        adminChannel.emit("update available client");
    }

    function shutdownClientsByIC(ic){
        log("ic: " + ic)
        for(var i = 0;i< clients.length;i++){
            var client = clients[i];
            if(client.identifier_code == ic){
                log("client to be terminated: " + client.id + " ic: " + client.identifier_code)
                client.emit("shutdown","terminate all " + ic + " devices")
            }
        }
    }

    function getDistinctIC(){
        var t = [];
        for(var i = 0;i< clients.length;i++){
            var client = clients[i];
            log(client.identifier_code);
            if(existIC(t, client.identifier_code)){
                continue;
            }
            var obj = {};
            obj.id = client.id
            obj.identifier_code = client.identifier_code
            t.push(obj);
        }
        for(var i = 0;i< t.length;i++){
            t[i].number_of_clients = icCount(t[i].identifier_code)
        }

        for(var i = 0;i< t.length;i++){
            log(JSON.stringify(t[i]));
        }

        return t;
    }

    function existIC(source, ic){
        var exist = false;
        for(var i = 0;i< source.length;i++){
            var obj = source[i];
            if(obj.identifier_code == ic){
                exist = true;
                break;
            }
        }
        return exist;
    }

    function icCount(ic){
        var count = 0;
        for(var i = 0;i< clients.length;i++){
            var client = clients[i];
            if(client.identifier_code == ic){
                count++;
            }
        }
        return count;
    }

    var clients = [];

    var clientChannel = io.of("/client");
    clientChannel.on("connection",function(socket){
        log("new socket client: " + socket.id + " connected.");
        socket.emit("registration");
        socket.on("disconnect",function(){
            log("socket client: " + socket.id + " disconnected.");
            clients.splice(clients.indexOf(socket),1);
            logAvailableClients()
        })
        socket.on("registration",function(identifier_code,cb){
            log("The identifier code: " + identifier_code);
            socket.identifier_code = identifier_code;
            clients.push(socket);
            logAvailableClients();
            cb(true);
        })
    })

    var adminChannel = io.of("/admin");

    adminChannel.on("connection",function(socket){
        log("new socket admin client: " + socket.id + " connected.");
        socket.on("disconnect",function(){
            log("socket admin client: " + socket.id + " disconnected.");
        })
        socket.on("available client",function(){
            log("get available client");
            socket.emit("available client",getDistinctIC());
        })
        socket.on("shutdown",function(ic){
            shutdownClientsByIC(ic);
        })
    })

    


}