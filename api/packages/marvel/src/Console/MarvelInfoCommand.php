<?php

namespace oglab\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use oglab\Traits\ENVSetupTrait;

use function Laravel\Prompts\{text, table, confirm, info};

class oglabInfoCommand extends Command
{
    use ENVSetupTrait;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'oglab:help';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'oglab command information';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Check if the .env file exists
        $this->CheckENVExistOrNot();
        try {
                // Read the current .env content
                $envFilePath = base_path('.env');
                $envContent = File::get($envFilePath);
                $targetKeys = ['APP_NAME','APP_ENV','APP_DEBUG','APP_URL','APP_VERSION','APP_SERVICE','APP_NOTICE_DOMAIN','DUMMY_DATA_PATH']; // Add the keys you want to display
                info('Basic application information.');
                $this->existingKeyValueInENV($targetKeys, $envContent);


                info('Available oglab Command');

                table(['Command', 'Details'], [
                    ['oglab:install', 'Installing oglab application'],
                    ['oglab:env-setup', 'Setup necessary config in .env file'],
                    ['oglab:database-setup', 'Setup MySQL database in .env file'],
                    ['oglab:mail-setup', 'Mail server setup (mailtrap, mailgun, gmail)'],
                    ['oglab:mailchimp-newsletter', 'Mailchimp newsletter setup in .env file'],
                    ['oglab:frontend-setup', 'Frontend URL setup (admin & shop)'],
                    ['oglab:aws-setup', 'AWS (bucket) setup'],
                    ['oglab:create-admin', 'Create an admin user'],
                    ['oglab:default-language-setup', 'Setup default language in .env file'],
                    ['oglab:open-ai-setup', 'Setup OpenAI in .env file'],
                    ['oglab:otp-gateway-setup', 'OTP SMS gateway (Twilio or MessageBird) setup in .env file'],
                    ['oglab:queue-setup', 'Setup queue connection in .env file. (e.g. database or sync)'],
                    ['oglab:seed', 'Import Demo Data'],
                    ['oglab:settings-seed', 'Import Settings Data'],
                    ['oglab:translation-enable', 'Enable translation settings in .env file (true/false)'],
                    ['oglab:test-mail-send', 'Send an email for credentials check'],
                ]);

                $this->info("'oglab:env-setup' command has some Quick Access Key");

                table(['Quick Access Key', 'Details'], [
                    ['mail', 'Mail server setup (mailtrap, mailgun, gmail)'],
                    ['database', 'Setup MySQL database in .env file'],
                    ['newsletter', 'Mailchimp newsletter setup in .env file'],
                    ['frontend-connection', 'Frontend URL setup (admin & shop)'],
                    ['aws', 'AWS (bucket) setup'],
                    ['default-language', 'Setup default language in .env file'],
                    ['open-ai', 'Setup OpenAI in .env file'],
                    ['otp', 'OTP SMS gateway (Twilio or MessageBird) setup in .env file'],
                    ['queue-connection', 'Setup queue connection in .env file. (e.g. database or sync)'],
                    ['translation-enable', 'Enable translation settings in .env file (true/false)'],
                    ['test-mail', 'Send an email for credentials check'],
                ]);


                table(['The command looks like:'], [
                    ['oglab:env-setup mail'],
                ]);

        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
