import { NextRequest, NextResponse } from 'next/server';
import { otpRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (!otpRateLimit.check(ip)) {
            return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const { mobile } = await req.json();

        // 1. Validation
        if (!mobile || !/^\d{10}$/.test(mobile)) {
            return NextResponse.json({ success: false, message: 'Invalid mobile number' }, { status: 400 });
        }

        // 2. MSG91 API Call
        const authkey = process.env.MSG91_AUTHKEY!;
        const templateId = process.env.MSG91_TEMPLATE_ID!;
        const sender = process.env.MSG91_SENDER_ID!;
        const country = process.env.MSG91_COUNTRY_CODE || '91';

        // Construct URL efficiently
        const url = new URL('https://control.msg91.com/api/v5/otp');
        url.searchParams.append('authkey', authkey);

        const payload = {
            template_id: templateId,
            mobile: `${country}${mobile}`,
            sender,
            otp_length: 6,
        };

        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        // 3. Response Handling
        const data = await res.json();

        if (!res.ok) {
            // MSG91 sometimes returns 200 even for errors in type="error", but fetch ok covers HTTP errors
            console.error('MSG91 Error:', data);
            throw new Error(data.message || 'Failed to send OTP');
        }

        // Check specific MSG91 error fields if necessary, though status check usually suffices for HTTP
        if (data.type === 'error') {
            throw new Error(data.message || 'MSG91 Service Error');
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } catch (error: any) {
        console.error('Send OTP Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
