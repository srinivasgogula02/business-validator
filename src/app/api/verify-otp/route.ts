import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { otpRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (!otpRateLimit.check(ip)) {
            return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const { mobile, otp } = await req.json();

        if (!mobile || !otp) {
            return NextResponse.json({ success: false, message: 'Mobile and OTP are required' }, { status: 400 });
        }

        // 1. Verify with MSG91
        const authkey = process.env.MSG91_AUTHKEY!;
        const country = process.env.MSG91_COUNTRY_CODE || '91';

        // Construct URL efficiently
        const url = new URL('https://control.msg91.com/api/v5/otp/verify');
        url.searchParams.append('mobile', `${country}${mobile}`);
        url.searchParams.append('otp', otp);
        url.searchParams.append('authkey', authkey);

        const res = await fetch(url.toString(), { method: 'GET' });
        const data = await res.json();

        if (!res.ok || data.type === 'error') {
            return NextResponse.json({ success: false, message: data.message || 'Invalid OTP' }, { status: 400 });
        }

        // 2. Shadow Account Logic
        const supabase = await createClient();
        const shadowEmail = `${mobile}@mobile.oneasy.com`;

        // Securely hash the shadow password using the backend secret
        const secret = process.env.SUPABASE_SHADOW_SECRET || 'fallback_insecure_secret_deploy_soon';
        const shadowPassword = crypto.createHmac('sha256', secret).update(mobile).digest('hex');

        // Attempt Sign In
        let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: shadowEmail,
            password: shadowPassword,
        });

        // If Sign In fails
        if (signInError) {
            // Check if it's specifically "Email not confirmed"
            if (signInError.message.includes('Email not confirmed')) {
                return NextResponse.json({
                    success: false,
                    message: 'Account exists but email is not confirmed. Please disable "Confirm Email" in Supabase Auth Settings -> Providers -> Email.'
                }, { status: 400 });
            }

            // If user doesn't exist (Invalid login credentials), Sign Up
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: shadowEmail,
                password: shadowPassword,
                options: {
                    data: {
                        full_name: `Mobile User ${mobile}`,
                        phone: mobile,
                        is_mobile_user: true
                    }
                }
            });

            if (signUpError) {
                console.error('Sign Up Error:', signUpError);
                throw new Error('Failed to create account: ' + signUpError.message);
            }

            // If email confirmation is off, signUp usually returns a session. 
            if (!signUpData.session) {
                // Attempt immediate sign-in to check if it works (race condition or different behavior)
                const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                    email: shadowEmail,
                    password: shadowPassword,
                });

                if (retryError || !retryData.session) {
                    // If retry also fails, it's definitely the setting
                    const msg = retryError?.message.includes('Email not confirmed')
                        ? 'Account created but email not confirmed. Please disable "Confirm Email" in Supabase Auth Settings.'
                        : 'Account created but no session returned. Please check Email Confirmation settings in Supabase.';

                    return NextResponse.json({ success: false, message: msg }, { status: 400 });
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Authenticated successfully' });
    } catch (error: any) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
