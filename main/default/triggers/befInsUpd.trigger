trigger befInsUpd on Bus__c (before Insert, before Update) {

   
    List<Bus_Starting_Selling_Price__mdt> bssps = [SELECT MasterLabel,Starting_Selling_Price__c FROM Bus_Starting_Selling_Price__mdt];
    Map <String,Decimal> capToSSP = new Map <String,Decimal> () ;
    for (Bus_Starting_Selling_Price__mdt bssp: bssps) {
        capToSSP.put (bssp.MasterLabel, bssp.Starting_Selling_Price__c) ;
    }   
    for (Bus__c b: Trigger.new) {
        if (b.Current_Status__c == 'Ready For Use') {
            Decimal startPrice = capToSSP.get (b.Maximum_Capacity__c) ;
            Decimal resaleVal = startPrice ;
            if (b.Has_A_C__c) {
                resaleVal += startPrice * 3/100;
            }
            if (Integer.valueOf (b.Year__c) <= 1972) {
                resaleVal += startPrice * 34/100;    
            }
            if (b.Odometer_reading__c > 100000) {
                resaleVal -= ((b.Odometer_reading__c - 100000) * 0.1) ;
            }
            b.Resale_Value__c = String.valueof(resaleVal) ;
        }
        else {
            b.Resale_Value__c = 'N/A' ;
        }
    }


}