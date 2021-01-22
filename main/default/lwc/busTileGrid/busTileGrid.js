import { LightningElement, wire } from 'lwc';
import getAllBuses from '@salesforce/apex/BusUtil.getAllBuses';
import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import BUS_UPDATED_MESSAGE from '@salesforce/messageChannel/BusUpdated__c';
import { refreshApex } from '@salesforce/apex';


export default class busTileGrid extends LightningElement {
    buses;

    @wire(getAllBuses)
    wiredBuses(result) {
        this.buses = result; 
        const { data, error } = result; 
        if (data) {
            console.log ('got data no error');
            console.log (this.buses) ;
        } else if (error) {
            alert (error) ;
        }
    }

    @wire(MessageContext)
    messageContext;

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                BUS_UPDATED_MESSAGE,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleMessage(message) {
        // Refresh if an update was made to one of the buses
console.log ('inside handleMessage1') ;
        refreshApex(this.buses);
console.log ('inside handleMessage2') ;
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }


}