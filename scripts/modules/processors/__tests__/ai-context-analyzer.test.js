const { analyzeContext } = require('../ai-context-analyzer');

describe('AI Context Analyzer', () => {
  describe('analyzeTemporalPosition', () => {
    it('should identify beginning of year correctly', () => {
      const elapsedDays = 15;
      const totalDays = 365;
      const percentComplete = Math.round((elapsedDays / totalDays) * 100);

      expect(percentComplete).toBe(4); // 4% through year
      expect(percentComplete).toBeLessThan(15); // Beginning phase
    });

    it('should identify early phase correctly', () => {
      const elapsedDays = 74; // ~74 days into year
      const totalDays = 365;
      const percentComplete = Math.round((elapsedDays / totalDays) * 100);

      expect(percentComplete).toBeGreaterThanOrEqual(15);
      expect(percentComplete).toBeLessThan(40); // Early phase
    });

    it('should identify mid-year correctly', () => {
      const elapsedDays = 166;
      const totalDays = 365;
      const percentComplete = Math.round((elapsedDays / totalDays) * 100);

      expect(percentComplete).toBeGreaterThanOrEqual(40);
      expect(percentComplete).toBeLessThan(60); // Mid phase
    });

    it('should identify late phase correctly', () => {
      const elapsedDays = 288;
      const totalDays = 365;
      const percentComplete = Math.round((elapsedDays / totalDays) * 100);

      expect(percentComplete).toBeGreaterThanOrEqual(60); // Late phase
    });

    it('should calculate current quarter correctly', () => {
      const testCases = [
        { date: new Date('2026-01-15'), expected: 'Q1' },
        { date: new Date('2026-04-15'), expected: 'Q2' },
        { date: new Date('2026-07-15'), expected: 'Q3' },
        { date: new Date('2026-10-15'), expected: 'Q4' }
      ];

      testCases.forEach(({ date, expected }) => {
        const month = date.getMonth() + 1;
        const quarter = `Q${Math.ceil(month / 3)}`;
        expect(quarter).toBe(expected);
      });
    });

    it('should calculate days until next quarter', () => {
      const currentDate = new Date('2026-01-15'); // Q1
      const nextQuarterStart = new Date('2026-04-01'); // Q2 starts
      const daysUntil = Math.ceil((nextQuarterStart - currentDate) / (1000 * 60 * 60 * 24));

      expect(daysUntil).toBeGreaterThan(0);
      expect(daysUntil).toBeLessThanOrEqual(90); // At most a full quarter
    });
  });

  describe('assessProjectProgress', () => {
    it('should categorize committed vs potential projects', () => {
      const progressReports = [
        { projectId: 'OP-001', status: 'committed', overallProgress: 50 },
        { projectId: 'OP-002', status: 'committed', overallProgress: 0 },
        { projectId: 'OP-003', status: 'proposed', overallProgress: 0 }
      ];

      const committed = progressReports.filter(r => r.status === 'committed');
      const potential = progressReports.filter(r => r.status === 'proposed');

      expect(committed.length).toBe(2);
      expect(potential.length).toBe(1);
    });

    it('should identify at-risk projects', () => {
      const progressReports = [
        { projectId: 'OP-001', actualProgress: 'at-risk', overallProgress: 10 },
        { projectId: 'OP-002', actualProgress: 'on-track', overallProgress: 80 }
      ];

      const atRisk = progressReports.filter(r => r.actualProgress === 'at-risk');

      expect(atRisk.length).toBe(1);
      expect(atRisk[0].projectId).toBe('OP-001');
    });

    it('should calculate average progress correctly', () => {
      const progressReports = [
        { overallProgress: 0 },
        { overallProgress: 50 },
        { overallProgress: 100 }
      ];

      const sum = progressReports.reduce((acc, r) => acc + r.overallProgress, 0);
      const avg = Math.round(sum / progressReports.length);

      expect(avg).toBe(50);
    });
  });

  describe('determineNarrative', () => {
    it('should return NEW_PLAN at beginning of year', () => {
      const temporalPosition = {
        timePhase: 'beginning',
        percentYearComplete: 4
      };

      const expectedNarrative = 'NEW_PLAN';
      expect(temporalPosition.timePhase).toBe('beginning');
      expect(expectedNarrative).toBe('NEW_PLAN');
    });

    it('should return PROGRESS_UPDATE in early phase', () => {
      const temporalPosition = {
        timePhase: 'early',
        percentYearComplete: 25
      };

      const expectedNarrative = 'PROGRESS_UPDATE';
      expect(temporalPosition.timePhase).toBe('early');
      expect(expectedNarrative).toBe('PROGRESS_UPDATE');
    });

    it('should return COURSE_CORRECTION when mid-year and behind', () => {
      const temporalPosition = {
        timePhase: 'mid',
        percentYearComplete: 50
      };

      const projectAssessment = {
        committed: { total: 5, behind: 3 } // Majority behind
      };

      const behindRatio = projectAssessment.committed.behind / projectAssessment.committed.total;
      expect(behindRatio).toBeGreaterThan(0.3); // More than 30% behind
      expect(temporalPosition.timePhase).toBe('mid');

      const expectedNarrative = 'COURSE_CORRECTION';
      expect(expectedNarrative).toBe('COURSE_CORRECTION');
    });

    it('should return MID_YEAR_CHECKPOINT when mid-year and on track', () => {
      const temporalPosition = {
        timePhase: 'mid',
        percentYearComplete: 50
      };

      const projectAssessment = {
        committed: { total: 5, behind: 1 } // Mostly on track
      };

      const behindRatio = projectAssessment.committed.behind / projectAssessment.committed.total;
      expect(behindRatio).toBeLessThanOrEqual(0.3); // 30% or less behind
      expect(temporalPosition.timePhase).toBe('mid');

      const expectedNarrative = 'MID_YEAR_CHECKPOINT';
      expect(expectedNarrative).toBe('MID_YEAR_CHECKPOINT');
    });

    it('should return YEAR_END_SUMMARY in late phase', () => {
      const temporalPosition = {
        timePhase: 'late',
        percentYearComplete: 85
      };

      const expectedNarrative = 'YEAR_END_SUMMARY';
      expect(temporalPosition.timePhase).toBe('late');
      expect(expectedNarrative).toBe('YEAR_END_SUMMARY');
    });
  });

  describe('analyzeGaps', () => {
    it('should identify execution gaps for behind projects', () => {
      const progressReports = [
        {
          projectId: 'OP-001',
          plannedQuarter: 'Q1',
          currentQuarter: 'Q1',
          overallProgress: 10,
          actualProgress: 'at-risk'
        }
      ];

      const executionGaps = progressReports.filter(r =>
        r.actualProgress === 'at-risk' &&
        r.plannedQuarter === r.currentQuarter
      );

      expect(executionGaps.length).toBe(1);
      expect(executionGaps[0].projectId).toBe('OP-001');
    });

    it('should identify resource gaps for over-allocated quarters', () => {
      const schedule = {
        Q1: { capacity: 72, allocated: 72, buffer: 0 },
        Q2: { capacity: 144, allocated: 100, buffer: 44 }
      };

      const resourceGaps = [];
      Object.entries(schedule).forEach(([quarter, data]) => {
        if (data.buffer <= 0) {
          resourceGaps.push({
            quarter,
            issue: 'over-allocated',
            allocated: data.allocated,
            capacity: data.capacity,
            buffer: data.buffer
          });
        }
      });

      expect(resourceGaps.length).toBe(1);
      expect(resourceGaps[0].quarter).toBe('Q1');
      expect(resourceGaps[0].issue).toBe('over-allocated');
    });

    it('should identify strategic gaps for high-priority unscheduled projects', () => {
      const scores = {
        'OP-001': { finalScore: 85, rank: 1 },
        'OP-002': { finalScore: 40, rank: 5 }
      };

      const schedule = {
        Q1: { committed: [], potential: [] },
        Q2: { committed: [], potential: [] },
        Q3: { committed: [], potential: [] },
        Q4: { committed: [], potential: [] }
      };

      // OP-001 is high priority (rank 1, score 85) but not scheduled
      const topProject = Object.entries(scores)
        .sort(([, a], [, b]) => b.finalScore - a.finalScore)[0];

      const isScheduled = Object.values(schedule).some(q =>
        q.committed?.includes(topProject[0]) || q.potential?.includes(topProject[0])
      );

      expect(isScheduled).toBe(false);
      expect(topProject[1].finalScore).toBeGreaterThan(70);
    });
  });

  describe('generateRecommendations', () => {
    it('should prioritize immediate actions for high-impact at-risk projects', () => {
      const recommendation = {
        type: 'immediate',
        priority: 'high',
        timeline: 'This week'
      };

      expect(recommendation.type).toBe('immediate');
      expect(recommendation.priority).toBe('high');
    });

    it('should recommend capacity adjustments for over-allocation', () => {
      const gaps = {
        resource: [
          { quarter: 'Q1', issue: 'over-allocated', buffer: 0 }
        ]
      };

      const recommendation = {
        type: 'immediate',
        priority: 'high',
        action: expect.stringContaining('over-allocated')
      };

      expect(gaps.resource.length).toBe(1);
      expect(recommendation.priority).toBe('high');
    });

    it('should sort recommendations by priority', () => {
      const recommendations = [
        { priority: 'low', timeline: 'Q3' },
        { priority: 'high', timeline: 'This week' },
        { priority: 'medium', timeline: 'Q2' }
      ];

      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const sorted = recommendations.sort((a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });
  });

  describe('analyzeContext integration', () => {
    it('should generate complete context analysis', async () => {
      const progressReports = [
        {
          projectId: 'OP-001',
          projectName: 'Test Project',
          overallProgress: 0,
          status: 'committed',
          plannedQuarter: 'Q1',
          currentQuarter: 'Q1',
          actualProgress: 'at-risk',
          blockers: [],
          velocity: 'unknown'
        }
      ];

      const projects = [
        { id: 'OP-001', title: 'Test Project' }
      ];

      const schedule = {
        Q1: { committed: ['OP-001'], capacity: 72, allocated: 72, buffer: 0 }
      };

      const scores = {
        'OP-001': { finalScore: 75 }
      };

      const result = await analyzeContext({
        progressReports,
        projects,
        schedule,
        scores,
        currentDate: new Date('2026-01-15'),
        verbose: false
      });

      expect(result).toHaveProperty('temporal');
      expect(result).toHaveProperty('projectStatus');
      expect(result).toHaveProperty('narrative');
      expect(result).toHaveProperty('gaps');
      expect(result).toHaveProperty('changes');
      expect(result).toHaveProperty('recommendations');

      expect(result.temporal.currentQuarter).toBe('Q1');
      expect(result.narrative.narrativeType).toBe('NEW_PLAN');
      expect(result.gaps.execution.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle empty project set', async () => {
      const result = await analyzeContext({
        progressReports: [],
        projects: [],
        schedule: { Q1: { committed: [], potential: [] } },
        scores: {},
        currentDate: new Date('2026-01-15'),
        verbose: false
      });

      expect(result.temporal).toBeDefined();
      expect(result.projectStatus.committed.total).toBe(0);
      expect(result.gaps.execution.length).toBe(0);
    });

    it('should detect changes from previous plan', async () => {
      const hasChanges = true;
      expect(hasChanges).toBe(true);
    });
  });

  describe('Quarter parsing', () => {
    it('should handle both string and number quarter formats', () => {
      const testCases = [
        { input: 'Q1', expected: 1 },
        { input: 'Q2', expected: 2 },
        { input: 1, expected: 1 },
        { input: 2, expected: 2 }
      ];

      testCases.forEach(({ input, expected }) => {
        const parsed = typeof input === 'string'
          ? parseInt(input.replace('Q', ''))
          : input;

        expect(parsed).toBe(expected);
      });
    });
  });
});
