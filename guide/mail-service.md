사내 시스템 연계 시 가장 중요한 것은 **인프라 종속성 분리**입니다. 로컬에서는 로그만 찍거나 가짜 응답을 보내고, 운영 환경에서는 실제 API를 호출할 수 있도록 **추상 클래스(Interface 역할을 하는 Abstract Class)**와 **Factory Provider**를 활용한 구조를 제안합니다.

아래 내용을 `GEMINI.md`에 추가하거나 CLI 요청용으로 활용하세요.

---

# 📧 Mailing System Integration: Infrastructure Strategy

사내 Knox 메일링 서비스 호출 로직을 환경에 따라 유연하게 전환하기 위해 **Adapter 패턴**을 적용합니다.

## 1. Interface & DTO Definition
모든 메일링 구현체가 준수해야 할 규격입니다.

```typescript
// src/common/interfaces/mailer.interface.ts
export abstract class MailerProvider {
  abstract sendMail(mailData: MailRequestDto): Promise<void>;
}

// src/common/dto/mail-request.dto.ts
export class MailRequestDto {
  subject: string;
  docSecuType: 'PERSONAL' | 'OFFICIAL';
  contents: string;
  contentType: 'TEXT' | 'MIME' | 'HTML';
  sender: SenderDto;
  recipients: RecipientDto[];
  attachments?: any[];
  reservedTime?: string;
}
```

---

## 2. Multi-Environment Implementations

### A. Production (Knox API 구현)
```typescript
// src/infrastructure/mail/knox-mailer.provider.ts
@Injectable()
export class KnoxMailerProvider extends MailerProvider {
  constructor(private readonly httpService: HttpService, private readonly config: ConfigService) {}

  async sendMail(mailData: MailRequestDto): Promise<void> {
    const apiUrl = this.config.get('KNOX_MAIL_API_URL');
    try {
      await this.httpService.post(apiUrl, mailData).toPromise();
      console.log(`[Knox] Mail sent: ${mailData.subject}`);
    } catch (error) {
      console.error('[Knox] Send failed:', error.message);
      // 의뢰 로직에 영향을 주지 않도록 내부에서 에러 처리
    }
  }
}
```

### B. Local / Dev (Mock 구현)
```typescript
// src/infrastructure/mail/dev-mailer.provider.ts
@Injectable()
export class DevMailerProvider extends MailerProvider {
  async sendMail(mailData: MailRequestDto): Promise<void> {
    // 실제 발송 대신 콘솔에 출력하여 디버깅 지원
    console.log('--- [DEV MAIL LOG] ---');
    console.log(`To: ${mailData.recipients.map(r => r.emailAddress).join(', ')}`);
    console.log(`Subject: ${mailData.subject}`);
    console.log(`Content: ${mailData.contents}`);
    console.log('-----------------------');
  }
}
```

---

## 3. Dynamic Module Configuration
환경 변수에 따라 적절한 클래스를 주입(DI)하도록 설정합니다.

```typescript
// src/infrastructure/mail/mail.module.ts
@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: MailerProvider,
      useClass: process.env.NODE_ENV === 'production' ? KnoxMailerProvider : DevMailerProvider,
    },
  ],
  exports: [MailerProvider],
})
export class MailModule {}
```

---

## 4. Application Logic (Service Use Case)
비즈니스 로직은 어떤 구현체인지 알 필요 없이 `MailerProvider` 인터페이스에만 의존합니다.

```typescript
// src/domain/request/request.service.ts
@Injectable()
export class RequestService {
  constructor(
    private prisma: PrismaService,
    private mailer: MailerProvider, // 추상 클래스 주입
  ) {}

  async createRequest(input: CreateRequestInput, requesterId: string) {
    const newRequest = await this.prisma.request.create({ data: { ...input, requesterId } });

    const mailRequest: MailRequestDto = {
      subject: `[RFGo] 신규 의뢰: ${newRequest.title}`,
      docSecuType: 'OFFICIAL',
      contentType: 'HTML',
      contents: `<h3>신규 의뢰 확인</h3><p>${newRequest.description}</p>`,
      sender: { emailAddress: 'rfgo-system' },
      recipients: [{ emailAddress: requesterId, recipientType: 'TO' }],
    };

    // 비동기 실행 (await 생략하여 메인 로직 응답 속도 확보)
    this.mailer.sendMail(mailRequest); 

    return newRequest;
  }
}
```

---

## 💡 Implementation Strategy for Local to Production

1.  **Local Development**: `.env`에 `NODE_ENV=development` 설정. 실제 메일 발송 없이 콘솔 로그로 데이터 규격 확인 가능.
2.  **S-Net / Production Transition**: 
    - `InternalSsoAdapter`와 마찬가지로 `KnoxMailerProvider` 내의 `KNOX_MAIL_API_URL` 환경 변수만 실제 운영 주소로 교체.
    - 보안 규정상 별도의 인증 헤더(`API-KEY` 등)가 필요할 경우 `KnoxMailerProvider` 클래스 내부만 수정하면 되므로 비즈니스 로직(RequestService)은 전혀 수정할 필요가 없음.
3.  **Scalability**: 메일 발송량이 많아질 경우 `Bull` 큐 시스템을 `MailerProvider`와 `RequestService` 사이에 끼워 넣어 비동기 처리를 강화하는 방향으로 쉽게 확장 가능.

---

사내 시스템 연계 시 가장 중요한 것은 **인프라 종속성 분리**입니다. 로컬에서는 로그만 찍거나 가짜 응답을 보내고, 운영 환경에서는 실제 API를 호출할 수 있도록 **추상 클래스(Interface 역할을 하는 Abstract Class)**와 **Factory Provider**를 활용한 구조를 제안합니다.

아래 내용을 `GEMINI.md`에 추가하거나 CLI 요청용으로 활용하세요.

---

# 📧 Mailing System Integration: Infrastructure Strategy

사내 Knox 메일링 서비스 호출 로직을 환경에 따라 유연하게 전환하기 위해 **Adapter 패턴**을 적용합니다.

## 1. Interface & DTO Definition
모든 메일링 구현체가 준수해야 할 규격입니다.

```typescript
// src/common/interfaces/mailer.interface.ts
export abstract class MailerProvider {
  abstract sendMail(mailData: MailRequestDto): Promise<void>;
}

// src/common/dto/mail-request.dto.ts
export class MailRequestDto {
  subject: string;
  docSecuType: 'PERSONAL' | 'OFFICIAL';
  contents: string;
  contentType: 'TEXT' | 'MIME' | 'HTML';
  sender: SenderDto;
  recipients: RecipientDto[];
  attachments?: any[];
  reservedTime?: string;
}
```

---

## 2. Multi-Environment Implementations

### A. Production (Knox API 구현)
```typescript
// src/infrastructure/mail/knox-mailer.provider.ts
@Injectable()
export class KnoxMailerProvider extends MailerProvider {
  constructor(private readonly httpService: HttpService, private readonly config: ConfigService) {}

  async sendMail(mailData: MailRequestDto): Promise<void> {
    const apiUrl = this.config.get('KNOX_MAIL_API_URL');
    try {
      await this.httpService.post(apiUrl, mailData).toPromise();
      console.log(`[Knox] Mail sent: ${mailData.subject}`);
    } catch (error) {
      console.error('[Knox] Send failed:', error.message);
      // 의뢰 로직에 영향을 주지 않도록 내부에서 에러 처리
    }
  }
}
```

### B. Local / Dev (Mock 구현)
```typescript
// src/infrastructure/mail/dev-mailer.provider.ts
@Injectable()
export class DevMailerProvider extends MailerProvider {
  async sendMail(mailData: MailRequestDto): Promise<void> {
    // 실제 발송 대신 콘솔에 출력하여 디버깅 지원
    console.log('--- [DEV MAIL LOG] ---');
    console.log(`To: ${mailData.recipients.map(r => r.emailAddress).join(', ')}`);
    console.log(`Subject: ${mailData.subject}`);
    console.log(`Content: ${mailData.contents}`);
    console.log('-----------------------');
  }
}
```

---

## 3. Dynamic Module Configuration
환경 변수에 따라 적절한 클래스를 주입(DI)하도록 설정합니다.

```typescript
// src/infrastructure/mail/mail.module.ts
@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: MailerProvider,
      useClass: process.env.NODE_ENV === 'production' ? KnoxMailerProvider : DevMailerProvider,
    },
  ],
  exports: [MailerProvider],
})
export class MailModule {}
```

---

## 4. Application Logic (Service Use Case)
비즈니스 로직은 어떤 구현체인지 알 필요 없이 `MailerProvider` 인터페이스에만 의존합니다.

```typescript
// src/domain/request/request.service.ts
@Injectable()
export class RequestService {
  constructor(
    private prisma: PrismaService,
    private mailer: MailerProvider, // 추상 클래스 주입
  ) {}

  async createRequest(input: CreateRequestInput, requesterId: string) {
    const newRequest = await this.prisma.request.create({ data: { ...input, requesterId } });

    const mailRequest: MailRequestDto = {
      subject: `[RFGo] 신규 의뢰: ${newRequest.title}`,
      docSecuType: 'OFFICIAL',
      contentType: 'HTML',
      contents: `<h3>신규 의뢰 확인</h3><p>${newRequest.description}</p>`,
      sender: { emailAddress: 'rfgo-system' },
      recipients: [{ emailAddress: requesterId, recipientType: 'TO' }],
    };

    // 비동기 실행 (await 생략하여 메인 로직 응답 속도 확보)
    this.mailer.sendMail(mailRequest); 

    return newRequest;
  }
}
```

---

## 💡 Implementation Strategy for Local to Production

1.  **Local Development**: `.env`에 `NODE_ENV=development` 설정. 실제 메일 발송 없이 콘솔 로그로 데이터 규격 확인 가능.
2.  **S-Net / Production Transition**: 
    - `InternalSsoAdapter`와 마찬가지로 `KnoxMailerProvider` 내의 `KNOX_MAIL_API_URL` 환경 변수만 실제 운영 주소로 교체.
    - 보안 규정상 별도의 인증 헤더(`API-KEY` 등)가 필요할 경우 `KnoxMailerProvider` 클래스 내부만 수정하면 되므로 비즈니스 로직(RequestService)은 전혀 수정할 필요가 없음.
3.  **Scalability**: 메일 발송량이 많아질 경우 `Bull` 큐 시스템을 `MailerProvider`와 `RequestService` 사이에 끼워 넣어 비동기 처리를 강화하는 방향으로 쉽게 확장 가능.

---

