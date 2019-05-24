let chai = require('chai');
let mocha = require('mocha');
let chaiHttp = require('chai-http');
let assert = require('assert');

const expect = require('chai').expect;
chai.use(chaiHttp);
const url= 'http://localhost:3000';


describe('Transfer Money', () => {
    let contractAddress = '0xC29b447c8b40B828814c5b1B4b1e574DA5a9b59B';
    it('Get Tokens 1', function (done) {
        this.timeout(20000);
        chai.request(url)
            .post('/bets/tokens/getFromAddress')
            .send({
                address: '0xD7938F40cE185a0B4CD82eeD99bB31d0D93c5c54',
                contractAddress: contractAddress
            })
            .end(function(err,res) {
                console.log(res);
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Transfer Tokens', function (done) {
        this.timeout(20000);
        chai.request(url)
            .post('/bets/tokens/transfer')
            .send({
                toAddress: '0xD7938F40cE185a0B4CD82eeD99bB31d0D93c5c54',
                fromAddress: '0xf6530d95CA04FA4C6b3D006777B882f6E7BEe05d',
                tokens: 15,
                contractAddress: contractAddress
            })
            .end(function(err,res) {
                console.log(res);
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Get Tokens 2', function (done) {
        this.timeout(20000);
        chai.request(url)
            .post('/bets/tokens/getFromAddress')
            .send({
                address: '0xD7938F40cE185a0B4CD82eeD99bB31d0D93c5c54',
                contractAddress: contractAddress
            })
            .end(function(err,res) {
                console.log(res);
                expect(res).to.have.status(200);
                done();
            });
    });

});

describe('BET', () => {
    let bet = {
        summoner: "Slemp",
        game: {},
        teamA: [],
        teamB: [],
        team: "A",
        tokens: 30,
        duration: 30
    };

    let contractAddress = '';
    let betId = '';

    it('Search Summoner', function (done) {
        this.timeout(20000);
        chai.request(url)
        .post('/summoners/searchSummoner')
        .send({
            summonerName: bet.summoner
        })
        .end( function(err,res) {
            bet.game = res.body;
            console.log(bet);
            expect(res).to.have.status(200);
            done();
        });
    });

    it('Create Teams', function (done) {
        this.timeout(20000);
        bet.game.participants.forEach(participant => {
            if(participant.team === 100) {
                bet.teamA.push(participant);
            } else if(participant.team === 200) {
                bet.teamB.push(participant);
            }
        });
        assert.strictEqual(bet.teamA.length, 5);
        assert.strictEqual(bet.teamB.length, 5);
        done();
    });

    it('Create Bet', function (done) {
        this.timeout(20000);
        chai.request(url)
            .post('/bets/create')
            .send({
                bet: bet
            })
            .end( function(err,res) {
                contractAddress = res.body.contractAddress;
                betId = res.body.bet._id;
                done();
            });
    });

    it('Accept Bet', function (done) {
        this.timeout(20000);
        chai.request(url)
            .post('/bets/accept')
            .send({
                tokens: 30,
                bet: betId,
                address: '0xD7938F40cE185a0B4CD82eeD99bB31d0D93c5c54',
                contractAddress: contractAddress
            })
            .end( function(err,res) {
                done();
            });
    });

});
