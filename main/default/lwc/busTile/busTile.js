import { LightningElement, api, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import BUS_SELECTED_MESSAGE from '@salesforce/messageChannel/BusSelected__c';
export default class busTile extends LightningElement {
    mybus;
    imageURL ;

    @wire(MessageContext)
    messageContext;

    @api
    get bus() {
        return this.mybus;
    }

    set bus(value) {
       this.mybus = value ;
       this.imageURL = "/resource/" + value.Image_Static_Resource__c;
    }

    handleClick(event) {
console.log ("in handleClick") ;
        const payload = { busId: this.mybus.Id };
        publish(this.messageContext, BUS_SELECTED_MESSAGE, payload);
    }

}