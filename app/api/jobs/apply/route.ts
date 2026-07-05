import { NextRequest, NextResponse } from 'next/server';

type JobApplicationPayload = {
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  desiredPosition?: string;
  experienceLevel?: string;
  availability?: string;
  preferredStartDate?: string;
  isOver18?: boolean;
  hasFoodHandlerCard?: boolean;
  hasTabcCertification?: boolean;
  previousRestaurantExperience?: string;
  message?: string;
};

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanBool(value: unknown) {
  return value === true;
}

function kvrsBaseUrl() {
  return (
    process.env.KVRS_API_URL ||
    process.env.NEXT_PUBLIC_KVRS_URL ||
    process.env.NEXT_PUBLIC_KVRS_BASE_URL ||
    'http://localhost:3001'
  ).replace(/\/$/, '');
}

function kvrsJobApplicationsUrl() {
  const base = kvrsBaseUrl();
  if (base.endsWith('/api/public')) {
    return `${base}/job-applications`;
  }
  return `${base}/api/public/job-applications`;
}

function validate(payload: JobApplicationPayload) {
  const applicantName = cleanText(payload.applicantName);
  const applicantEmail = cleanText(payload.applicantEmail);
  const applicantPhone = cleanText(payload.applicantPhone);
  const desiredPosition = cleanText(payload.desiredPosition);
  const availability = cleanText(payload.availability);

  if (!applicantName) return 'Please enter your full name.';
  if (!applicantEmail || !/^\S+@\S+\.\S+$/.test(applicantEmail)) return 'Please enter a valid email address.';
  if (!applicantPhone) return 'Please enter your phone number.';
  if (!desiredPosition) return 'Please choose the position you are interested in.';
  if (!availability) return 'Please tell us your availability.';

  return null;
}

export async function POST(request: NextRequest) {
  let rawPayload: JobApplicationPayload;

  try {
    rawPayload = (await request.json()) as JobApplicationPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Please check the form and try again.' }, { status: 400 });
  }

  const validationError = validate(rawPayload);

  if (validationError) {
    return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
  }

  const payload = {
    applicantName: cleanText(rawPayload.applicantName),
    applicantEmail: cleanText(rawPayload.applicantEmail),
    applicantPhone: cleanText(rawPayload.applicantPhone),
    desiredPosition: cleanText(rawPayload.desiredPosition),
    experienceLevel: cleanText(rawPayload.experienceLevel),
    availability: cleanText(rawPayload.availability),
    preferredStartDate: cleanText(rawPayload.preferredStartDate),
    isOver18: cleanBool(rawPayload.isOver18),
    hasFoodHandlerCard: cleanBool(rawPayload.hasFoodHandlerCard),
    hasTabcCertification: cleanBool(rawPayload.hasTabcCertification),
    previousRestaurantExperience: cleanText(rawPayload.previousRestaurantExperience),
    message: cleanText(rawPayload.message),
  };

  try {
    const response = await fetch(kvrsJobApplicationsUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const result = (await response.json().catch(() => null)) as {
      ok?: boolean;
      applicationId?: string;
      error?: string;
    } | null;

    if (!response.ok || !result?.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result?.error || 'We could not submit your application. Please try again.',
        },
        { status: response.status || 502 },
      );
    }

    return NextResponse.json({ ok: true, applicationId: result.applicationId ?? null });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'We could not reach the application system right now. Please try again in a few minutes.',
      },
      { status: 502 },
    );
  }
}
