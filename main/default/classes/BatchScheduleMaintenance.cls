global class BatchScheduleMaintenance implements Database.Batchable<sObject> {
    global Database.QueryLocator start(Database.BatchableContext bc) {
        // Get all buses which are not currently cheduled for maintenance or being repaired
        String query = 'SELECT Id, Odometer_reading__c, Last_Ping_Location__c FROM Bus__c where Current_Status__c = \'Ready For Use\'';
        return Database.getQueryLocator(query);
    }
    global void execute(Database.BatchableContext bc, List<Bus__c> buses){
        // Get the Bus Ids
        List<Id> busIds = new List<Id> () ;
        for (Bus__c bus: buses) {
            busIds.add (bus.Id) ;
        }
        // Now get last routine maintenance for each bus
        Map <Id,Decimal> lastRMMap = new Map <Id,Decimal> () ;
        AggregateResult[] groupedResults = [SELECT Bus__c,Max(Recorded_Odometer__c) FROM Maintenance_Record__c where Schedule_Reason__c = 'Routine Maintenance' and Status__c = 'Completed' group by Bus__c];
        for (AggregateResult ar : groupedResults)  {
            lastRMMap.put ((Id)ar.get('Bus__c'),(Decimal)ar.get('expr0')) ;
        }
        List <Bus__c> busesforMaint = new List<Bus__c> () ;
        for (Bus__c bus: buses) {
            // Use division by 5000 to see if the next routine maintenance is due
            if (lastRMMap.get(bus.Id) != null && (Integer)bus.Odometer_reading__c/5000 > Integer.valueOf(lastRMMap.get(bus.Id))/5000) {
                bus.Current_Status__c = 'Scheduled for Maintenance';
                busesForMaint.add (bus) ;
            }
        }
        // Create new scheduled maintenances
        if (busesForMaint.size() > 0) {
            // Get location for all garages
            Map <Location,Id> garageLocToId = new Map <Location,Id> () ;
            for (Garage__c g : [select Id,Location__c from Garage__c]) {
                garageLocToId.put (g.Location__c, g.Id) ;
            }
            // Now create Maintenance Record for each bus, using nearest garage
            List <Maintenance_Record__c> mrsToIns = new List <Maintenance_Record__c> () ;
            for (Bus__c bfm: busesForMaint) {
                // Need to find the nearest garage
                Double maxDist = 0 ;
                Id gId ;
                Location loc1 = bfm.Last_Ping_Location__c ;
                for (Location gloc: garageLocToId.keySet()) {
                    Double dist = Location.getDistance(loc1, gloc, 'mi');
                    if (dist > maxDist) {
                        maxDist = dist ;
                        gId = garageLocToId.get(gloc) ;
                    }
                }
                // Assume, without knowing full requirements, that bus should be scheduled for maintenance 8 hours from when this job runs
                mrsToIns.add(new Maintenance_Record__c (Bus__c = bfm.Id, Garage__c = gId, Schedule_Reason__c = 'Routine Maintenance', Schedule_Time__c = datetime.now().addHours(8), Status__c = 'Scheduled')) ;
            }
            update busesForMaint;
            insert mrsToIns ;
        }
    }    
    global void finish(Database.BatchableContext bc){
    }    
}