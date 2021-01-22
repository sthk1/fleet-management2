import { LightningElement, wire, api } from 'lwc';
import { getFieldValue } from 'lightning/uiRecordApi';
import { publish, subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import BUS_SELECTED_MESSAGE from '@salesforce/messageChannel/BusSelected__c';
import BUS_UPDATED_MESSAGE from '@salesforce/messageChannel/BusUpdated__c';



import BUS_OBJECT from '@salesforce/schema/Bus__c';
import NAME_FIELD from '@salesforce/schema/Bus__c.Name';
import YEAR_FIELD from '@salesforce/schema/Bus__c.Year__c';
import STATUS_FIELD from '@salesforce/schema/Bus__c.Current_Status__c';
import AC_FIELD from '@salesforce/schema/Bus__c.Has_A_C__c';
import CAP_FIELD from '@salesforce/schema/Bus__c.Maximum_Capacity__c';
import WHEELS_FIELD from '@salesforce/schema/Bus__c.Number_of_Wheels__c';
import ODO_FIELD from '@salesforce/schema/Bus__c.Odometer_reading__c';
import RSALE_FIELD from '@salesforce/schema/Bus__c.Resale_Value__c';

export default class editBus extends LightningElement {
    nameField = NAME_FIELD;
    yearField = YEAR_FIELD;
    statusField = STATUS_FIELD;
    acField = AC_FIELD;
    capField = CAP_FIELD;
    wheelsField = WHEELS_FIELD;
    odoField = ODO_FIELD;
    rsaleField = RSALE_FIELD;

    @api recordId;

    @wire(MessageContext)
    messageContext;

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                BUS_SELECTED_MESSAGE,
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
        this.recordId = message.busId;
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    handleSuccess (event) {
console.log ('about to publish') ;
        publish(this.messageContext, BUS_UPDATED_MESSAGE, null);
    }

    handleReset(event) {
    const inputFields = this.template.querySelectorAll(
        'lightning-input-field'
    );
    if (inputFields) {
        inputFields.forEach(field => {
            field.reset();
        });
    }
}
    


}