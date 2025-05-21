import 'dotenv/config'; //import dotfiles
import { Test, TestingModule } from '@nestjs/testing';
import { GeminiController } from './Gemini.controller';
import { GeminiService } from './Gemini.service';
import { getDate, getHours, getMinutes, getMonth, getYear } from 'date-fns';

describe('Gemini Controller', () => {
  let geminiController: GeminiController;
  const currentYear = getYear(Date.now());
  const currentMonth = (getMonth(Date.now()) + 1).toString().padStart(2, '0');
  const currentDay = getDate(Date.now()).toString().padStart(2, '0');
  const tomorrowDay = getDate(Date.now() + 24 * 60 * 60 * 1000).toString().padStart(2, '0'); // Add one day in milliseconds

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GeminiController],
      providers: [GeminiService],
    }).compile();

    geminiController = app.get<GeminiController>(GeminiController);
  });

  describe('Change text to command', () => {
    type outputType = {
      object: string;
      action: string;
      location?: string;
    };
    const output = {
      object: 'fuad',
      action: 'call',
    };
    it('should return call fuad command', async () => {
      const result = await geminiController.changeTextToCommand({ text: 'call fuad' });
      console.log(result)
      if (result)
        expect(JSON.parse(result)).toMatchObject<outputType>(output);
    });

    it('should normalize a simple Ethiopian time alarm', async () => {
      const result = await geminiController.changeTextToCommand({ text: 'ለጠዋት 1 ሰዓት ከ 30 ደቂቃ ላይ ደውልልኝ' }); // Call me at 1:30 Ethiopian time
      if (result)
        expect(JSON.parse(result)).toMatchObject<outputType>({ object: `07:30:${parseInt(currentDay) + 1}:${currentMonth}:${currentYear}`, action: 'call' });
    });

    it('should normalize an Ethiopian morning alarm', async () => {
      const result = await geminiController.changeTextToCommand({ text: 'ለ ጠዋት 12 ሰዓት አላርም አስቀምጥ' }); // Set alarm for 12 in the morning Ethiopian time
      if (result)
        expect(JSON.parse(result)).toMatchObject<outputType>({ object: `06:00:${parseInt(currentDay) + 1}:${currentMonth}:${currentYear}`, action: 'set alarm' });
    });

    it('should normalize an appointment with a date', async () => {
      const result = await geminiController.changeTextToCommand({ text: 'ለ 8 ሰዓት ከሰዓት በኋላ በ 20/05/2025 ቀጠሮ ያዝ' }); // Set appointment for 8 PM on 20/05/2025
      if (result)
        expect(JSON.parse(result)).toMatchObject<outputType>({ object: '14:00:20:05:2025', action: 'set appointment' });
    });

    it('should handle "tomorrow" for an alarm', async () => {
      const result = await geminiController.changeTextToCommand({ text: 'ነገ 7 ሰዓት ላይ አላርም አስቀምጥ' }); // Turn on at 7 tomorrow
      const expectedDay = tomorrowDay;
      if (result)
        expect(JSON.parse(result)).toMatchObject<outputType>({ object: `13:00:${expectedDay}:${currentMonth}:${currentYear}`, action: 'set alarm' });
    });

    it('should handle a reminder without a year (using current year)', async () => {
      const futureDay = getDate(Date.now() + 7 * 24 * 60 * 60 * 1000).toString().padStart(2, '0'); // Example: 7 days in the future
      const futureMonth = (getMonth(Date.now() + 7 * 24 * 60 * 60 * 1000) + 1).toString().padStart(2, '0');
      const result = await geminiController.changeTextToCommand({ text: `ለማታ 3 ሰዓት ከ 45 ደቂቃ ላይ አስታውሰኝ በ ${futureDay}/${futureMonth}` }); // Remind me at 3:45 on a future date this month
      console.log(result)
      if (result)
        expect(JSON.parse(result)).toMatchObject<outputType>({ object: `21:45:${futureDay}:${futureMonth}:${currentYear}`, action: 'remind' });
    });

    it('should handle a wakeword', async () => {
      const result = await geminiController.changeTextToCommand({ text: 'አቤ' });
      if (result)
        expect(JSON.parse(result)).toMatchObject<outputType>({ object: '', action: 'wakeword' });
    });

    it('should handle a light command with location', async () => {
      const result = await geminiController.changeTextToCommand({ text: 'ሳሎን መብራቱን አጥፋ' }); // Turn off the living room light
      if (result)
        expect(JSON.parse(result)).toMatchObject<outputType>({ object: 'light', action: 'turn off', location: 'living room' });
    });
    it('should handle a bathroom light command with location', async () => {
      const result = await geminiController.changeTextToCommand({ text: 'የሸንት ቤት  መብራቱን አጥፋ' }); // Turn off the living room light
      if (result)
        expect(JSON.parse(result)).toMatchObject<outputType>({ object: 'light', action: 'turn off', location: 'bath room' });
    });
  });
});

describe('Match contacts', () => {
  let geminiController: GeminiController;
  const name = 'እናቱ';
  const contacts = ['mamy', 'ተስፋዬ', 'አበበ', 'dad'];
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GeminiController],
      providers: [GeminiService],
    }).compile();

    geminiController = app.get<GeminiController>(GeminiController);
  });
  it('should return "mamy"', async () => {
    const result = await geminiController.matchContact({ name, contacts });
    console.log("result", result)
    expect(result).toMatch("mamy")
  })
});
