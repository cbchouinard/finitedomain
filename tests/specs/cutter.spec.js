import expect from '../fixtures/mocha_proxy.fixt';
import solverSolver from '../../src/runner';

describe('specs/cutter.spec', function() {

  it('should eq', function() {
    // note that this test doesnt even reach the cutter... eq makes A and alias of B and then removes the eq
    let solution = solverSolver(`
      @custom var-strat throw
      : A *
      : B *
      A == B
      A > 10
    `);

    expect(solution).to.eql({A: 11, B: 11}); // a choice has to be made so min(B)=0, A=B.
  });

  it('should neq', function() {
    let solution = solverSolver(`
      @custom var-strat throw
      : A *
      : B *
      A != B
      A > 10
    `);

    expect(solution).to.eql({A: [11, 100000000], B: 0});
  });

  it('should lt', function() {
    let solution = solverSolver(`
      @custom var-strat throw
      : A *
      : B *
      A < B
      A > 10
    `);

    expect(solution).to.eql({A: 11, B: 12});
  });

  it('should lte', function() {
    let solution = solverSolver(`
      @custom var-strat throw
      : A *
      : B *
      A <= B
      A > 10
    `);

    expect(solution).to.eql({A: 11, B: 11});
  });

  it('should iseq vvv', function() {
    let solution = solverSolver(`
      @custom var-strat throw
      : A *
      : B 11
      : C [0 1]
      C = A ==? B
      A > 10
    `);

    expect(solution).to.eql({A: 11, B: 11, C: 1});
  });

  it('should iseq v8v', function() {
    let solution = solverSolver(`
      @custom var-strat throw
      : A [0 2]
      : C [0 1]
      C = A ==? 2
    `);

    expect(solution).to.eql({A: 0, C: 0});
  });

  it('should isneq', function() {
    let solution = solverSolver(`
      @custom var-strat throw
      : A *
      : B 11
      : C *
      C = A !=? B
      A > 10
    `);

    expect(solution).to.eql({A: 11, B: 11, C: 0});
  });

  it('should islt', function() {
    let solution = solverSolver(`
      @custom var-strat throw
      : A *
      : B 11
      : C *
      C = A <? B
      @custom noleaf A B
    `);

    expect(solution).to.eql({A: 0, B: 11, C: 1});
  });

  it('should islte', function() {
    let solution = solverSolver(`
      @custom var-strat throw
      : A *
      : B 11
      : C *
      C = A <=? B
      @custom noleaf A
    `);

    expect(solution).to.eql({A: 0, B: 11, C: 1});
  });

  describe('sum', function() {

    it('should remove simple bool case', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        : R [0 3]
        R = sum(A B C)
        @custom noleaf A B C
      `);

      // should solve because R doesnt actually restrict its sum args (the result of any combination is in R)
      expect(solution).to.eql({A: 0, B: 0, C: 0, R: 0});
    });

    it('should remove simple bool and constant case', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        : R [4 7]
        R = sum(A 4 B C)
        @custom noleaf A B C
      `);

      // should solve because R doesnt actually restrict its sum args (the result of any combination is in R)
      expect(solution).to.eql({A: 0, B: 0, C: 0, R: 4, __1: 4});
    });

    it('should remove if R wraps whole range', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 0 2 2]
        : B [0 1]
        : C [0 1]
        : D [0 1]
        : R [0 5]
        R = sum(A B C D)
        @custom noleaf A B C D
      `);

      // should solve because R doesnt actually restrict its sum args (the result of any combination is in R)
      expect(solution).to.eql({A: 0, B: 0, C: 0, D: 0, R: 0});
    });

    it('should rewrite a leaf isnall to nall', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        : D [0 1]
        : R [0 3] # n-1
        R = sum(A B C D)
        @custom noleaf A B C D
      `)).to.throw(/ops: nall /);
    });

    it('should detect trivial isall patterns', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        R = sum(A B C)
        S = R ==? 3
      `);

      expect(solution).to.eql({A: 0, B: 0, C: 0, R: 0, S: 0}); // implicit choices through the solveStack wont bother with 11131
    });

    it('should detect reverse trivial isall patterns', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        S = R ==? 3
        R = sum(A B C)
      `);

      expect(solution).to.eql({A: 0, B: 0, C: 0, R: 0, S: 0}); // implicit choices through the solveStack wont bother with 11131
    });
  });

  describe('plus', function() {

    it('should rewrite combined isAll to a leaf var', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        R = A + B
        S = R ==? 2
      `);

      expect(solution).to.eql({A: 0, B: 0, R: 0, S: 0}); // implicit choices through the solveStack wont bother with 1121
    });

    it('should isall leaf case be reversable', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        S = R ==? 2
        R = A + B
      `);

      expect(solution).to.eql({A: 0, B: 0, R: 0, S: 0}); // implicit choices through the solveStack wont bother with 1121
    });
  });

  it.skip('should reduce double isnall as nall', function() {
    let solution = solverSolver(`
        @custom var-strat throw
        : a, b, c, d, e, f [0 1]
        A = all?(a b c)
        B = all?(d e f)
        nall(A B)
        # -> nall(a b c d e f)
      `);

    expect(solution).to.eql({});
  });

  describe('xnor booly', function() {

    it('should solve the base case', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 0 5 5]
        : B [0 10]
        : C [0 1]
        C = B ==? 8
        A !^ C
        @custom noleaf A B
      `)).to.throw(/ops: iseq /);
    });

    it('should eliminate xnor when the arg is booly', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 0 5 5]
        : B [0 10]
        : C [0 1]
        C = B ==? 8
        A !^ C
        @custom noleaf A B
      `)).to.throw(/debug: .* ops: iseq /);
      // note: this may change/improve but the relevant part is that the xnor is gone!
    });

    it('should eliminate xnor when the other arg is booly', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 0 5 5]
        : B [0 10]
        : C [0 1]
        C = B ==? 8
        C !^ A
        @custom noleaf A B
      `)).to.throw(/debug: .* ops: iseq /);
      // note: this may change/improve but the relevant part is that the xnor is gone!
    });

    it('should eliminate xnor when both args are booly 8', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 0 5 5]
        : B [0 10]
        : C [0 1]
        C = B ==? 8
        C !^ A
        # -> should remove the !^
        @custom noleaf A B
      `)).to.throw(/ops: iseq /);
    });

    it('should eliminate xnor when both args are booly 5', function() {
      //why solve if iseq 8 but not when iseq 5?
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 0 5 5]
        : B [0 10]
        : C [0 1]
        C = B ==? 5
        C !^ A
        # -> should remove the !^
        @custom noleaf A B
      `)).to.throw(/ops: iseq /);
    });

    it('should not apply trick to non-boolys', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 0 5 5]
        : B [0 10]
        : C [0 1]
        C = B ==? 8
        A !^ C
        @custom noleaf A B C
      `)).to.throw(/debug: .* ops: iseq,xnor /);
    });
  });

  describe('lte_rhs+isall_r trick', function() {

    it('should morph the basic case', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A, B, C, D [0 1]
        R = all?(A B)
        C <= R
        # -->  C <= A, C <= B
        @custom noleaf A B C
      `)).to.throw(/ops: lte,lte /);
    });

    it('should morph three args if there is enough space', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A, B, C, D, X [0 1]
        : M = 1
        X = all?(A B C)
        D <= X
        # -->  D <= A, D <= B, D <= C
        M == M      # recycle-able space after eliminating the tautology
        M == M      # recycle-able space after eliminating the tautology
        M == M      # recycle-able space after eliminating the tautology
        M == M      # recycle-able space after eliminating the tautology
        @custom noleaf A B C D
      `)).to.throw(/ops: lte,lte,lte /);
    });

    describe('should not morph the basic case if isall args are not boolean', function() {

      function test(bools, nonbools) {
        it('bools: ' + bools + ', nonbools: ' + nonbools, function() {
          expect(_ => solverSolver(`
            @custom var-strat throw
            : ${bools} [0 1]
            : ${nonbools} [0 10]
            R = all?(A B)
            C <= R

            @custom noleaf A B C
          `)).to.throw(/ops: isall,lte /);
        });
      }

      test('B,R,C', 'A');
      test('A,R,C', 'B');
      test('C,R', 'A,B');
    });

    describe('should not morph the multi-isall case if not boolean', function() {

      function test(bools, nonbools) {
        it('bools: ' + bools + ', nonbools: ' + nonbools, function() {
          expect(_ => solverSolver(`
            @custom var-strat throw
            : ${bools} [0 1]
            : ${nonbools} [0 10]
            : M = 1
            X = all?(A B C)
            D <= X
            M == M      # recycle-able space after eliminating the tautology
            M == M      # recycle-able space after eliminating the tautology
            M == M      # recycle-able space after eliminating the tautology
            M == M      # recycle-able space after eliminating the tautology
            @custom noleaf A B C D
          `)).to.throw(/ops: isall,lte /);
        });
      }

      test('B,C,D,R', 'A');
      test('A,C,D,R', 'B');
      test('A,B,D,R', 'C');
      test('C,D,R', 'A,B');
      test('B,D,R', 'A,C');
      test('D,R', 'A,B,C');
    });
  });

  describe('lte_rhs+neq trick', function() {

    it('should rewrite base case of an lte and neq to a nand', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        A <= B
        B != C
        # -> A !& C
        @custom noleaf A C
      `)).to.throw(/ops: nand /);
    });

    it('should rewrite swapped base case of an lte and neq to a nand', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        B != C
        A <= B
        # -> A !& C
        @custom noleaf A C
      `)).to.throw(/ops: nand /);
    });

    it('should not do lte+neq trick for lhs of lte', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        B <= A
        B != C
        # -> A !& C
        @custom noleaf A C
      `)).to.throw(/ops: or /); // tackled by different trick
    });

    it('should not do lte+neq trick for non bools', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 2]
        : C [0 1]
        A <= B
        B != C
        # -> A !& C
        @custom noleaf A C
      `)).to.throw(/ops: lte,neq /);
    });
  });

  describe('lte_lhs+nand trick', function() {

    it('should eliminate base case of an lte and nand', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        A <= B
        A !& C
        # -> A is leaf var
        @custom noleaf B C
      `);

      expect(solution).to.eql({A: 0, B: 0, C: 0});
    });

    it('should eliminate swapped base case of an lte and nand', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        A !& C
        A <= B
        # -> A is leaf var
        @custom noleaf B C
      `);

      expect(solution).to.eql({A: 0, B: 0, C: 0});
    });

    it('should not do lte+neq trick for rhs of lte', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        A !& C
        B <= A
        @custom noleaf B C
      `)).to.throw(/ops: nand,lte /);
    });

    it('should not do lte+neq trick for non bools', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 2]
        : C [0 1]
        A <= B
        A !& C
        # -> A !& C
        @custom noleaf B C
      `)).to.throw(/ops: lte,nand /);
    });
  });

  describe('lte_lhs+isall_r trick', function() {

    it('should eliminate base case of an lte-lhs and isall-r', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        : D [0 1]
        A <= B
        A = all?(C D)
        # -> nall(B C D)
        @custom noleaf B C D
      `)).to.throw(/ops: nall /);
    });

    it('should eliminate swapped base case of an lte-lhs and isall-r', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        : D [0 1]
        A = all?(C D)
        A <= B
        # -> nall(B C D)
        @custom noleaf B C D
      `)).to.throw(/ops: nall /);
    });

    it('should not do lte-lhs + isall-r trick for rhs of lte', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        : D [0 1]
        A = all?(C D)
        B <= A
        @custom noleaf B C D
      `)).to.throw(/ops: lte,lte /);
    });

    it('should not do lte_lhs+neq trick for non bools', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 2]
        : C [0 1]
        : D [0 1]
        A <= B
        A = all?(C D)
        @custom noleaf B C D
      `)).to.throw(/ops: lte,isall /);
    });

    it('should work with more than two args to isall', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C, D, E, F [0 1]
        A <= B
        A = all?(C D E F)
        # -> nall(B C D E F)
        @custom noleaf B C D E F
      `)).to.throw(/ops: nall /);
    });
  });

  describe('isall_r+nall trick', function() {

    it('should rewrite base case v1 of an isall and nall to a nand', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        : D [0 1]
        A = all?(B C)
        nall(A B D)
        # -> A = all?(B C), A !& D
        # when A is 1, B and C are 1, so D must be 0 (for the nall)
        # when A is 0, B or C is 0, so the nall is resolved
        # when D is 1, A can't be 1 because then B is also one and the nall would break
        @custom noleaf B C D
      `)).to.throw(/ops: isall,nand /);
    });

    describe('all variations of nall arg order', function() {

      function test(A, B, C) {
        it('nall(' + A + ',' + B + ',' + C + ')', function() {
          expect(_ => solverSolver(`
          @custom var-strat throw
          : A [0 1]
          : B [0 1]
          : C [0 1]
          : D [0 1]
          A = all?(B C)
          nall(${A} ${B} ${C})

          @custom noleaf B C D
        `)).to.throw(/ops: isall,nand /);
        });
      }

      test('A', 'B', 'D');
      test('A', 'D', 'B');
      test('B', 'A', 'D');
      test('B', 'D', 'A');
      test('D', 'A', 'B');
      test('D', 'B', 'A');
    });
  });

  describe('isall+nand trick', function() {

    it('should eliminate base case of an lte-lhs and isall-r', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        : R [0 1]
        R = all?(A B)
        R !& C
        # -> nall(A B C)

        @custom noleaf A B C
      `)).to.throw(/ops: nall /);
    });

    it('should eliminate swapped base case of an lte-lhs and isall-r', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        : R [0 1]
        R !& C
        R = all?(A B)
        # -> nall(A B C)
        @custom noleaf A B C
      `)).to.throw(/ops: nall /);
    });
  });

  describe('2xlte trick', function() {

    it('should eliminate base case a double lte', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        A <= B
        A <= C
        # -> A is a leaf var, eliminate the constraints
        @custom noleaf B C
      `);

      expect(solution).to.eql({A: 0, B: 0, C: 0});
    });

    it('should eliminate swapped base case a double lte', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        A <= C
        A <= B
        # -> A is a leaf var, eliminate the constraints
        @custom noleaf B C
      `);

      expect(solution).to.eql({A: 0, B: 0, C: 0});
    });
  });

  describe('lte_lhs+neq trick', function() {

    it('should eliminate base case an lte_lhs and neq', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        A <= B
        A != C
        # -> B | C, A is a leaf
        @custom noleaf B C
      `)).to.throw(/ops: or /);
    });

    it('should eliminate swapped base case an lte_lhs and neq', function() {
      expect(_ => solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : C [0 1]
        A != C
        A <= B
        # -> B | C, A is a leaf
        @custom noleaf B C
      `)).to.throw(/ops: or /);
    });
  });
});