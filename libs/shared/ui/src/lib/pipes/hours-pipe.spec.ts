import { HoursPipe } from './hours-pipe';

describe('HoursPipe', () => {
  let pipe: HoursPipe;

  beforeEach(() => {
    pipe = new HoursPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return "--:--" for undefined input', () => {
      expect(pipe.transform(undefined)).toBe('--:--');
    });

    it('should format 0 seconds as "0:00"', () => {
      expect(pipe.transform(0)).toBe('0:00');
    });

    it('should format seconds less than an hour correctly', () => {
      expect(pipe.transform(60)).toBe('0:01'); // 1 minute
      expect(pipe.transform(300)).toBe('0:05'); // 5 minutes
      expect(pipe.transform(1800)).toBe('0:30'); // 30 minutes
      expect(pipe.transform(3540)).toBe('0:59'); // 59 minutes
    });

    it('should format exactly one hour as "1:00"', () => {
      expect(pipe.transform(3600)).toBe('1:00');
    });

    it('should format hours and minutes correctly', () => {
      expect(pipe.transform(3660)).toBe('1:01'); // 1 hour 1 minute
      expect(pipe.transform(3900)).toBe('1:05'); // 1 hour 5 minutes
      expect(pipe.transform(5400)).toBe('1:30'); // 1 hour 30 minutes
      expect(pipe.transform(7140)).toBe('1:59'); // 1 hour 59 minutes
      expect(pipe.transform(7200)).toBe('2:00'); // 2 hours
    });

    it('should format large hour values correctly', () => {
      expect(pipe.transform(36000)).toBe('10:00'); // 10 hours
      expect(pipe.transform(43200)).toBe('12:00'); // 12 hours
      expect(pipe.transform(86400)).toBe('24:00'); // 24 hours
      expect(pipe.transform(90000)).toBe('25:00'); // 25 hours
    });

    it('should pad minutes with zero when needed', () => {
      expect(pipe.transform(3605)).toBe('1:00'); // 1 hour 5 seconds (rounds down)
      expect(pipe.transform(3610)).toBe('1:00'); // 1 hour 10 seconds (rounds down)
      expect(pipe.transform(3660)).toBe('1:01'); // 1 hour 1 minute
      expect(pipe.transform(3720)).toBe('1:02'); // 1 hour 2 minutes
      expect(pipe.transform(3840)).toBe('1:04'); // 1 hour 4 minutes
    });

    it('should handle seconds that do not divide evenly into minutes', () => {
      expect(pipe.transform(125)).toBe('0:02'); // 2 minutes 5 seconds
      expect(pipe.transform(185)).toBe('0:03'); // 3 minutes 5 seconds
      expect(pipe.transform(3665)).toBe('1:01'); // 1 hour 1 minute 5 seconds
    });

    it('should handle very large numbers', () => {
      expect(pipe.transform(360000)).toBe('100:00'); // 100 hours
      expect(pipe.transform(3600000)).toBe('1000:00'); // 1000 hours
    });

    it('should handle decimal seconds by flooring them', () => {
      expect(pipe.transform(3600.9)).toBe('1:00'); // 1 hour (floors seconds)
      expect(pipe.transform(3559.9)).toBe('0:59'); // 59 minutes (floors seconds)
      expect(pipe.transform(119.9)).toBe('0:01'); // 1 minute (floors seconds)
    });

    it('should handle negative numbers (edge case)', () => {
      expect(pipe.transform(-60)).toBe('-0:01'); // This tests current behavior
      expect(pipe.transform(-3600)).toBe('-1:00'); // This tests current behavior
    });
  });
});
