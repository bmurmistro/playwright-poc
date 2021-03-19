'use strict';

const {
    VisualGridRunner,
    RunnerOptions,
    Eyes,
    Target,
    Configuration,
    RectangleSize,
    BatchInfo,
    BrowserType,
    DeviceName,
    ScreenOrientation
} = require('@applitools/eyes-playwright');
const playwright = require('playwright')

let eyes;

describe('playwright', function () {
    let runner, browser, page

    beforeEach(async () => {
        // Initialize the playwright browser
        browser = await playwright.chromium.launch()
        const context = await browser.newContext();
        page = await context.newPage();
        
        // Create a runner with concurrency of 1
        const runnerOptions = new RunnerOptions().testConcurrency(10)
        runner = new VisualGridRunner(runnerOptions);

        // Create Eyes object with the runner, meaning it'll be a Visual Grid eyes.
        eyes = new Eyes(runner);

        // Initialize the eyes configuration
        const configuration = new Configuration();

        // create a new batch info instance and set it to the configuration
        configuration.setBatch(new BatchInfo('Ultrafast Batch'))
        configuration.setLayoutBreakpoints(true);

        // Add browsers with different viewports
        configuration.addBrowser(1600, 1200, BrowserType.IE_11);
        configuration.addBrowser(1600, 1200, BrowserType.CHROME);
        configuration.addBrowser(1600, 1200, BrowserType.FIREFOX);
        configuration.addBrowser(1600, 1200, BrowserType.EDGE_CHROMIUM);
        configuration.addBrowser(1600, 1200, BrowserType.SAFARI);

        // Add mobile emulation devices in Portrait mode
        configuration.addDeviceEmulation(DeviceName.iPhone_X, ScreenOrientation.PORTRAIT);
        configuration.addDeviceEmulation(DeviceName.Pixel_2, ScreenOrientation.PORTRAIT);

        // Set the configuration to eyes
        eyes.setConfiguration(configuration);
    });


    it('ultraFastTest', async () => {

        await page.goto('http://page-templates.azurewebsites.net/#M365Scc.MiniReview.Default');
        await page.waitForSelector('[name=ListPage]');
        // Call Open on eyes to initialize a test session
        await eyes.open(page, 'Demo App', 'Ultrafast grid demo', new RectangleSize(1600, 1200));

        await page.waitForSelector('.ms-List');
        await eyes.check('Main Page', Target.window().fully().scrollRootElement("#viewport"));

        // check the login page with fluent api, see more info here
        await page.click('[name=ListPage]');
        await page.waitForSelector('.highcharts-container');

        await eyes.check('List Page', Target.window().fully().scrollRootElement("#viewport"));
        //await eyes.check('List Page2', Target.region("#viewport").fully().scrollRootElement("#viewport"));
        // Call Close on eyes to let the server know it should display the results
        await eyes.close();
    });

    afterEach(async () => {
        // Close the browser
        await browser.close()

        // If the test was aborted before eyes.close was called, ends the test as aborted.
        await eyes.abortIfNotClosed();

        // we pass false to this method to suppress the exception that is thrown if we
        // find visual differences
        const results = await runner.getAllTestResults(false);
        console.log(results);
    });

});
