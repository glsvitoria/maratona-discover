const modal = {
    open(){ //Aparecer na tela
        document.querySelector(".modal-overlay").classList.add("active");
    },
    close(){ //Tirar da tela
        document.querySelector(".modal-overlay").classList.remove("active");
    }
};

const transactions = [
    {
    description: 'Luz',
    amount: -50000, 
    date:'23/01/2021'
    },

    {
        description: 'Website',
        amount: 500000, 
        date:'23/01/2021'
    },

    {
        description: 'Internet',
        amount: -20013, 
        date:'23/01/2021'
    },
    {
        description: 'App',
        amount: 200000, 
        date:'23/01/2021'
    }
]

const Storage = { // Salvando todos os dados no navegador
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] //Transformando a string novamente em array para aprarecer novamente no site
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) // Transformando o arrays da transações em string para guardar
    }
}


const Transaction = {
    all: Storage.get(),
    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        let income = 0;
        // Pegar todas as transações
        // para cada as transações,
        Transaction.all.forEach((transaction) =>{
            // se ela for maior que zero
            if(transaction.amount > 0){
                // somar a uma variável e retornar a variavel
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses(){
        let expense = 0;
        Transaction.all.forEach((transaction) =>{
            // se ela for menor que zero
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total(){
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),
    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense"; /*Se o amount for maior que 0 adicionará a class income, se não expense*/ 

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `
        return html;
    },

    updateBalance(){
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes());
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses());
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
};

const Utils = { //Função para transformar um número em dinheiro
    formatAmount(value){
        value = value * 100

        return Math.round(value)
    },

    formatDate(date){
        const splittedDate = date.split("-") // Separá a string de acordo com os trancinhos, separando o ano dia e mes

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, ""); /*Tudo que não for número ele troca por "" - expressões regulares*/

        value = Number(value) / 100; 

        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        }); 

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value, 
            date: Form.date.value
        }
    },

    validateField(){
        const { description, amount, date} = Form.getValues()
        
        if(description.trim() === "" || 
        amount.trim() === "" || 
        date.trim() === ""){ // Caso um dos 3 esteja em branco ele encaminha o erro
            throw new Error("Por favor, preecha todos os campos")
        }
    },

    formatValues(){
        let { description, amount, date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()

        try { //Tentará fazer todas as funções a baixo

            // Verificar se todas as informações foram preenchidas
            Form.validateField()

            // formatar os dados para salvar
            const transaction = Form.formatValues()

            // salvar
            Transaction.add(transaction)

            // apagar os dados do formulário
            Form.clearFields()

            // modal feche
            modal.close()

            // atualizar aprlicação

        } catch (error){ //Caso não consiga ele faz um alert para usuário
            alert(error.message)
        }

        
    }
}


const App = {
    init(){
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance();

        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

