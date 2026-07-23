namespace RazorPageYourCouncilWebsite.Constants
{
    public static class WebsiteConstants
    {

        // URL path (can have hyphens)
        public static readonly string SITE_PATH = "your-council";
        
        // Controller name (no hyphens)
        public static readonly string SITE_CONTROLLER = "YourCouncil";
        
        // Views folder (can be whatever you want)
        public static readonly string VIEW_FOLDER = "your-council";
        
        // For backward compatibility
        public static readonly string SITE_NAME = SITE_CONTROLLER;
        public static readonly string SITE_VIEW_PATH = SITE_PATH + "/";
        public static readonly string View_Folder = VIEW_FOLDER;
        public static readonly string SHARED_COMPONENTS_PATH = "~/Pages/Components";
    

    }
}
