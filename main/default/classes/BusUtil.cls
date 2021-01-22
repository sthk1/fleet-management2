public class BusUtil {
	
    @AuraEnabled(Cacheable=true)
    public static List<Bus__c> getAllBuses() {
	return [select Id,Name,Image_Static_Resource__c from Bus__c];
    }
}