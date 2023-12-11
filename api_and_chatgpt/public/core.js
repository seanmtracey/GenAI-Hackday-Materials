(function(){

    'use strict';

    const transcript = document.querySelector('#transcript');
    const form = document.querySelector('form');
    const transactions = document.querySelector('#transactions');
    const transactionsList = transactions.querySelector('ol');
    const transactionsToggle = transactions.querySelector('#tab');

    let firstMessageSent = false;

    function getTransactions(){
        return fetch('/transactions')
            .then(res => {
                if(res.ok){
                    return res.json();
                } else {
                    throw res;
                }
            })
            .catch(err => {
                console.log("/transactions err:", err);
                return {};
            });
        ;
    }

    function addResponseToTranscript(data){

        const docFrag = document.createDocumentFragment();
        const div = document.createElement('div');
        const pre = document.createElement('pre');
        
        div.dataset.messageid = data.id;
        div.classList.add('aiResponse');
        pre.textContent = data.message;

        div.appendChild(pre);
        docFrag.appendChild(div);

        transcript.appendChild(docFrag);

    }

    function sendMessageToServer(message, alt){

        const docFrag = document.createDocumentFragment();
        const div = document.createElement('div');
        const p = document.createElement('p');
        
        div.classList.add('userInput');
        p.textContent = alt || message;

        div.appendChild(p);
        docFrag.appendChild(div);

        transcript.appendChild(docFrag);

        const lastMessage = Array.from(transcript.querySelectorAll('.aiResponse')).pop();

        const parentMessageId = lastMessage ? lastMessage.dataset.messageid : "";
        console.log(parentMessageId);

        fetch('/chat', {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                message,
                parentMessageId
            })
        })
        .then(res => {
            if(res.ok){
                return res.json();
            } else {
                throw res;
            }
        })
        .then(response => {
            console.log(response);
            addResponseToTranscript(response);
        })
        .catch(err => {
            console.log("sendMessageToServer err:", err);
        });

    }

    form.addEventListener('submit', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        console.log(this[0].value);

        if(!firstMessageSent){ 

            const selectedTransactions = Array.from(document.querySelectorAll('[data-selected="true"]'));
            console.log(selectedTransactions);
    
            const transactions = selectedTransactions.map(li => {
                return JSON.parse(li.dataset.data);
            });
            
            console.log(transactions);

            const prompt = `I'm working with an API which returns some transaction data as JSON objects. These are they: ${JSON.stringify(transactions)}. Can you answer the follow: ${this[0].value}`;

            sendMessageToServer(prompt, this[0].value);
            firstMessageSent = true;

        } else {
            sendMessageToServer(this[0].value);
        }

        form.reset();

    }, false);

    transactionsToggle.addEventListener('click', function(){
        transactions.dataset.state = transactions.dataset.state === "closed" ? "open" : "closed";
    }, false);

    getTransactions()
        .then(results => {
            console.log(results);
            const docFrag = document.createDocumentFragment();

            results.data.forEach(datum => {

                const li = document.createElement('li');

                li.dataset.data = JSON.stringify(datum);
                li.dataset.selected = "false";

                const h4 = document.createElement('h4');
                const h5 = document.createElement('h5');
                const span = document.createElement('span');

                h4.textContent = datum.amount.value;
                h5.textContent = datum.shortDescription;
                span.textContent = datum.longDescription;

                li.appendChild(h4);
                li.appendChild(h5);
                li.appendChild(span);

                li.addEventListener('click', function(e){
                    this.dataset.selected = this.dataset.selected === "false" ? "true" : "false";
                }, false);

                docFrag.appendChild(li);

            });

            transactionsList.innerHTML = "";
            transactionsList.appendChild(docFrag);

        })
        .catch(err => {
            console.log("getTransactions err:", err);
        })
    ;

    console.log("We good to go 🚀");

}());